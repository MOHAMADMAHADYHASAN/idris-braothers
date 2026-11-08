import { Prisma, SupplierLedgerType } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { purchasesRepository } from './purchases.repository';
import { inventoryRepository } from '../inventory/inventory.repository';
import { supplierRepository } from '../suppliers/suppliers.repository';
import { CreatePurchaseInput } from './purchases.validation';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import { getDayBoundaries, buildDateRangeFilter } from '../../common/utils/dateUtils';
import { generateDailySequenceCode } from '../../common/utils/codeGenerator';

export class PurchasesService {
  /**
   * Helper to generate unique purchase/chalan number: PUR-YYMMDD-XXXX
   */
  private async generatePurchaseNumber(tx: Prisma.TransactionClient): Promise<string> {
    const { startOfDay, endOfDay } = getDayBoundaries();
    const countToday = await purchasesRepository.countPurchasesToday(startOfDay, endOfDay, tx);
    return generateDailySequenceCode('PUR', countToday);
  }

  /**
   * Record Stock In / Mahajan Procurement (মহাজন থেকে মাল ক্রয় ও চালানের এন্ট্রি)
   */
  async createPurchase(data: CreatePurchaseInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate Supplier
      const supplier = await supplierRepository.findById(data.supplierId, tx);
      if (!supplier || !supplier.isActive) {
        throw new AppError('Supplier / Mahajan not found or inactive', 404);
      }

      // 2. Generate or validate purchaseNumber
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
        productId: string;
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
        const product = await inventoryRepository.findById(item.productId, tx);
        if (!product || !product.isActive) {
          throw new AppError(`Product with ID ${item.productId} not found or inactive`, 404);
        }

        const quantity = new Prisma.Decimal(item.quantity);
        const conversionFactor = new Prisma.Decimal(item.conversionFactor);
        const baseQuantity = quantity.mul(conversionFactor);

        // Add inventory in base unit
        await inventoryRepository.adjustStock(product.id, baseQuantity, 'ADD', tx);

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

        // Immediately revalue product prices on the Product table
        await inventoryRepository.updatePrices(product.id, priceUpdates, tx);

        // If requested, save/update this custom unit (carton/sack) for future use
        if (item.saveUnitForFuture) {
          await inventoryRepository.upsertUnit(
            product.id,
            item.unitName,
            conversionFactor,
            item.newRetailPrice ? new Prisma.Decimal(item.newRetailPrice) : null,
            item.newWholesalePrice ? new Prisma.Decimal(item.newWholesalePrice) : null,
            tx
          );
        }

        preparedItems.push({
          productId: product.id,
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
              productId: item.productId,
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
      const payableDelta = grandTotal.sub(paidAmount);
      const updatedSupplier = await supplierRepository.updatePayable(supplier.id, payableDelta, tx);

      await supplierRepository.createLedgerEntry(
        {
          supplier: { connect: { id: supplier.id } },
          purchase: { connect: { id: purchase.id } },
          entryType: SupplierLedgerType.PURCHASE_DUE,
          credit: grandTotal,
          debit: paidAmount,
          balanceAfter: updatedSupplier.currentPayable,
          note: `মাল ক্রয়ের চালান #${purchaseNumber}`,
        },
        tx
      );

      return {
        ...purchase,
        supplierCurrentPayable: updatedSupplier.currentPayable,
      };
    });
  }

  /**
   * Get purchases list with filters and pagination
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

    const dateFilter = buildDateRangeFilter(query.startDate, query.endDate);
    if (dateFilter) {
      where.createdAt = dateFilter;
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
   * Get single purchase details by ID
   */
  async getPurchaseById(id: string) {
    const purchase = await purchasesRepository.findById(id);
    if (!purchase) {
      throw new AppError('Purchase order / chalan not found', 404);
    }
    return purchase;
  }
}

export const purchasesService = new PurchasesService();
