import { Prisma, SupplierLedgerType } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { purchasesRepository } from './purchases.repository';
import { inventoryRepository } from '../inventory/inventory.repository';
import { supplierRepository } from '../suppliers/suppliers.repository';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import { getDayBoundaries } from '../../common/utils/dateUtils';
import { CreatePurchaseInput } from './purchases.validation';

export class PurchasesService {
  /**
   * Process a Procurement / Supplier Inward Challan (মাল ক্রয় ও স্টক বৃদ্ধি).
   * Atomic operations inside Prisma $transaction:
   * 1. Validate supplier and products/variants
   * 2. Increment inventory stock on ProductVariant
   * 3. Dynamic Replacement Cost Valuation: Update variant currentPurchasePrice (and optional new retail/wholesale prices)
   * 4. Save optional custom bulk units (VariantUnit) for future sales/purchases
   * 5. Generate purchase challan number (PUR-YYYYMMDD-XXXX) if not provided
   * 6. Create Purchase and PurchaseItem records linked to variantId
   * 7. Update Supplier Running Khata (Ledger) if credit/due exists
   */
  async createPurchase(data: CreatePurchaseInput) {
    // 1. Resolve supplier
    const supplier = await supplierRepository.findById(data.supplierId);
    if (!supplier || !supplier.isActive) {
      throw new AppError('Supplier not found or inactive', 404);
    }

    return await prisma.$transaction(async (tx) => {
      // 2. Generate or validate purchase challan number
      let purchaseNumber = data.purchaseNumber?.trim();
      if (!purchaseNumber) {
        purchaseNumber = await this.generatePurchaseNumber(tx);
      } else {
        const existing = await purchasesRepository.findByPurchaseNumber(purchaseNumber);
        if (existing) {
          throw new AppError(`Purchase number/chalan "${purchaseNumber}" already exists`, 409);
        }
      }

      // 3. Process items, add stock, and revalue replacement costs
      let calculatedSubTotal = new Prisma.Decimal(0);
      const preparedItems: {
        variantId: string;
        unitName: string;
        conversionFactor: Prisma.Decimal;
        quantity: Prisma.Decimal;
        baseQuantity: Prisma.Decimal;
        unitCost: Prisma.Decimal;
        newRetailPrice?: Prisma.Decimal;
        newWholesalePrice?: Prisma.Decimal;
        subTotal: Prisma.Decimal;
      }[] = [];

      for (const item of data.items) {
        let variant = null;
        if (item.variantId) {
          variant = await inventoryRepository.findVariantById(item.variantId, tx);
        } else if (item.productId) {
          const product = await inventoryRepository.findById(item.productId, tx);
          if (product && product.variants.length > 0) {
            variant = await inventoryRepository.findVariantById(product.variants[0].id, tx);
          }
        }

        if (!variant || !variant.isActive || !variant.product.isActive) {
          throw new AppError(`Item variant ${item.variantId || item.productId} not found or inactive`, 404);
        }

        const quantity = new Prisma.Decimal(item.quantity);
        const conversionFactor = new Prisma.Decimal(item.conversionFactor);
        const baseQuantity = quantity.mul(conversionFactor);

        // Add inventory in base unit to the variant stock pool
        await inventoryRepository.adjustStock(variant.id, baseQuantity, 'ADD', tx);

        const unitCost = new Prisma.Decimal(item.unitCost);
        const itemSubTotal = quantity.mul(unitCost);
        calculatedSubTotal = calculatedSubTotal.add(itemSubTotal);

        // Dynamic Replacement Cost Valuation:
        // Calculate new cost per base unit (e.g. if 50kg sack costs 6000 TK, cost per KG = 120 TK)
        const costPerBaseUnit = unitCost.div(conversionFactor);

        const priceUpdates: {
          currentPurchasePrice: Prisma.Decimal;
          retailPrice?: Prisma.Decimal;
          wholesalePrice?: Prisma.Decimal;
        } = {
          currentPurchasePrice: costPerBaseUnit,
        };

        if (item.newRetailPrice) {
          priceUpdates.retailPrice = new Prisma.Decimal(item.newRetailPrice);
        }
        if (item.newWholesalePrice) {
          priceUpdates.wholesalePrice = new Prisma.Decimal(item.newWholesalePrice);
        }

        // Immediately revalue product prices on the ProductVariant table
        await inventoryRepository.updatePrices(variant.id, priceUpdates, tx);

        // If requested, save/update this custom unit (carton/sack) for future use
        if (item.saveUnitForFuture) {
          await inventoryRepository.upsertUnit(
            variant.id,
            item.unitName,
            conversionFactor,
            item.newRetailPrice ? new Prisma.Decimal(item.newRetailPrice) : null,
            item.newWholesalePrice ? new Prisma.Decimal(item.newWholesalePrice) : null,
            null,
            tx
          );
        }

        preparedItems.push({
          variantId: variant.id,
          unitName: item.unitName,
          conversionFactor,
          quantity,
          baseQuantity,
          unitCost,
          newRetailPrice: item.newRetailPrice ? new Prisma.Decimal(item.newRetailPrice) : undefined,
          newWholesalePrice: item.newWholesalePrice ? new Prisma.Decimal(item.newWholesalePrice) : undefined,
          subTotal: itemSubTotal,
        });
      }

      // 4. Financial calculations
      const transportCost = new Prisma.Decimal(data.transportCost || 0);
      const discount = new Prisma.Decimal(data.discount || 0);
      const grandTotal = calculatedSubTotal.add(transportCost).sub(discount);
      if (grandTotal.lessThan(0)) {
        throw new AppError('Discount cannot exceed purchase total', 400);
      }

      const paidAmount = new Prisma.Decimal(data.paidAmount || 0);
      const dueAmount = grandTotal.sub(paidAmount);

      // 5. Create Purchase Record
      const purchase = await purchasesRepository.create(
        {
          purchaseNumber,
          supplier: { connect: { id: supplier.id } },
          subTotal: calculatedSubTotal,
          transportCost,
          discount,
          grandTotal,
          paidAmount,
          dueAmount,
          note: data.note,
          items: {
            create: preparedItems.map((item) => ({
              variant: { connect: { id: item.variantId } },
              unitName: item.unitName,
              conversionFactor: item.conversionFactor,
              quantity: item.quantity,
              baseQuantity: item.baseQuantity,
              unitCost: item.unitCost,
              newRetailPrice: item.newRetailPrice,
              newWholesalePrice: item.newWholesalePrice,
              subTotal: item.subTotal,
            })),
          },
        },
        tx
      );

      // 6. Atomic Supplier Khata / Ledger update
      let updatedSupplierPayable = null;
      if (grandTotal.greaterThan(0)) {
        const payableDelta = grandTotal.sub(paidAmount);
        const updatedSupplier = await supplierRepository.updatePayable(supplier.id, payableDelta, tx);
        updatedSupplierPayable = updatedSupplier.currentPayable;

        await supplierRepository.createLedgerEntry(
          {
            supplier: { connect: { id: supplier.id } },
            purchase: { connect: { id: purchase.id } },
            entryType: SupplierLedgerType.PURCHASE_DUE,
            credit: grandTotal,
            debit: paidAmount,
            balanceAfter: updatedSupplierPayable,
            note: `Purchase Chalan #${purchaseNumber}`,
          },
          tx
        );
      }

      return {
        purchase,
        supplierPayable: updatedSupplierPayable,
      };
    });
  }

  /**
   * Daily Purchase Challan number generator: PUR-YYYYMMDD-0001
   */
  private async generatePurchaseNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const { startOfDay, endOfDay } = getDayBoundaries();
    const todayCount = await purchasesRepository.countPurchasesToday(startOfDay, endOfDay, tx);

    const dateStr = startOfDay.toISOString().slice(0, 10).replace(/-/g, '');
    const sequenceStr = String(todayCount + 1).padStart(4, '0');

    return `PUR-${dateStr}-${sequenceStr}`;
  }

  /**
   * List purchase challans with filtering & pagination
   */
  async getPurchases(query: {
    supplierId?: string;
    purchaseNumber?: string;
    startDate?: string;
    endDate?: string;
  } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.PurchaseWhereInput = {};

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.purchaseNumber) {
      where.purchaseNumber = { contains: query.purchaseNumber, mode: 'insensitive' };
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(new Date(query.startDate).setHours(0, 0, 0, 0));
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(new Date(query.endDate).setHours(23, 59, 59, 999));
      }
    }

    const [total, purchases] = await Promise.all([
      purchasesRepository.count(where),
      purchasesRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      purchases,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get single purchase challan by ID
   */
  async getPurchaseById(id: string) {
    const purchase = await purchasesRepository.findById(id);

    if (!purchase) {
      throw new AppError('Purchase record not found', 404);
    }

    return purchase;
  }

  /**
   * Supplier Chalan Print formatting for Store Record
   */
  async generatePrintChallan(id: string) {
    const purchase = await this.getPurchaseById(id);

    const storeInfo = {
      storeName: 'ইদ্রিস ব্রাদার্স',
      tagline: 'পাইকারি ও খুচরা মসলা এবং মুদি মাল বিক্রয় কেন্দ্র',
      market: 'মরিচপট্টি, বড় বাজার, ফেনী',
    };

    const supplierInfo = {
      name: purchase.supplier.name,
      company: purchase.supplier.companyName || 'N/A',
      phone: purchase.supplier.phone || 'N/A',
      currentPayable: purchase.supplier.currentPayable,
    };

    const items = purchase.items.map((item, idx) => {
      const baseName = item.variant.product.banglaName || item.variant.product.name;
      const variantSuffix = item.variant.variantName !== 'Default' ? ` (${item.variant.variantName})` : '';
      return {
        sl: idx + 1,
        productName: `${baseName}${variantSuffix}`,
        unitName: item.unitName,
        quantity: item.quantity,
        unitCost: item.unitCost,
        subTotal: item.subTotal,
        newRetailPrice: item.newRetailPrice,
        newWholesalePrice: item.newWholesalePrice,
      };
    });

    return {
      store: storeInfo,
      challan: {
        purchaseNumber: purchase.purchaseNumber,
        date: purchase.createdAt.toLocaleDateString('bn-BD', { timeZone: 'Asia/Dhaka' }),
        status: purchase.status,
      },
      supplier: supplierInfo,
      items,
      billing: {
        subTotal: purchase.subTotal,
        transportCost: purchase.transportCost,
        discount: purchase.discount,
        grandTotal: purchase.grandTotal,
        paidAmount: purchase.paidAmount,
        dueAmount: purchase.dueAmount,
      },
      note: purchase.note,
    };
  }
}

export const purchasesService = new PurchasesService();
