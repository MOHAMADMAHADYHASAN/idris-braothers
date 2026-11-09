import { Prisma, SaleType, CustomerLedgerType } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { salesRepository } from './sales.repository';
import { inventoryRepository } from '../inventory/inventory.repository';
import { customerRepository } from '../customers/customers.repository';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import { getDayBoundaries } from '../../common/utils/dateUtils';
import { CreateSaleInput } from './sales.validation';

export class SalesService {
  /**
   * Process a complete POS / Store Counter Sale transaction.
   * Atomic operations inside Prisma $transaction:
   * 1. Validate customer and product variants
   * 2. Calculate prices (Standard quantity or Reverse price-to-weight)
   * 3. Enforce allowDecimalQty rules (whole numbers for packaged items)
   * 4. Deduct inventory stock from ProductVariant
   * 5. Capture replacement cost snapshot
   * 6. Generate chronological daily invoice number (INV-YYYYMMDD-XXXX)
   * 7. Save Sale and SaleItem records linked to variantId
   * 8. Update Customer Running Khata (Ledger) if credit/due exists
   */
  async createSale(data: CreateSaleInput) {
    // 1. Resolve customer if provided
    let customer = null;
    if (data.customerId) {
      customer = await customerRepository.findById(data.customerId);
      if (!customer || !customer.isActive) {
        throw new AppError('Customer not found or inactive', 404);
      }
    }

    return await prisma.$transaction(async (tx) => {
      let calculatedSubTotal = new Prisma.Decimal(0);
      const preparedItems: {
        variantId: string;
        unitName: string;
        conversionFactor: Prisma.Decimal;
        quantity: Prisma.Decimal;
        baseQuantity: Prisma.Decimal;
        unitPrice: Prisma.Decimal;
        costPriceSnapshot: Prisma.Decimal;
        subTotal: Prisma.Decimal;
      }[] = [];

      // 2. Process sale items
      for (const item of data.items) {
        // Resolve variant
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

        const conversionFactor = new Prisma.Decimal(item.conversionFactor || 1);
        let quantity: Prisma.Decimal;
        let baseQuantity: Prisma.Decimal;
        let unitPrice: Prisma.Decimal;
        let itemSubTotal: Prisma.Decimal;

        if (item.customTotalPrice !== undefined && item.customTotalPrice > 0) {
          // Reverse Price-to-Weight Calculation (টাকার অঙ্কে বিক্রি, e.g. ২০ টাকার এলাচ)
          if (!variant.allowDecimalQty) {
            throw new AppError(
              `Reverse price calculation is only supported for weighable/loose items. "${variant.product.name} - ${variant.variantName}" is a packaged item.`,
              400
            );
          }

          itemSubTotal = new Prisma.Decimal(item.customTotalPrice);

          if (item.unitPrice !== undefined) {
            unitPrice = new Prisma.Decimal(item.unitPrice);
          } else {
            unitPrice = data.saleType === 'WHOLESALE' ? variant.wholesalePrice : variant.retailPrice;
          }

          // Calculate price per base unit and back-calculate exact base quantity to 4 decimal places
          const pricePerBaseUnit = unitPrice.div(conversionFactor);
          baseQuantity = itemSubTotal.div(pricePerBaseUnit).toDecimalPlaces(4);
          quantity = baseQuantity.div(conversionFactor).toDecimalPlaces(4);
        } else if (item.quantity !== undefined && item.quantity > 0) {
          // Standard Unit/Quantity Sale Mode
          quantity = new Prisma.Decimal(item.quantity);

          // Enforce integer quantities for packaged goods
          if (!variant.allowDecimalQty && !quantity.isInteger()) {
            throw new AppError(
              `Fractional quantity (${quantity}) is not allowed for packaged/discrete item "${variant.product.name} - ${variant.variantName}". Please enter whole numbers (১, ২, ইত্যাদি).`,
              400
            );
          }

          baseQuantity = quantity.mul(conversionFactor);

          if (item.unitPrice !== undefined) {
            unitPrice = new Prisma.Decimal(item.unitPrice);
          } else {
            unitPrice = data.saleType === 'WHOLESALE' ? variant.wholesalePrice : variant.retailPrice;
          }

          itemSubTotal = quantity.mul(unitPrice);
        } else {
          throw new AppError(
            `Either quantity or customTotalPrice must be provided for "${variant.product.name}"`,
            400
          );
        }

        // Check inventory stock
        if (variant.stockQuantity.lessThan(baseQuantity)) {
          throw new AppError(
            `Insufficient stock for "${variant.product.name} - ${variant.variantName}". Required: ${baseQuantity} ${variant.baseUnitName}, Available: ${variant.stockQuantity} ${variant.baseUnitName}`,
            400
          );
        }

        // Deduct inventory in base unit from the specific SKU/variant
        await inventoryRepository.adjustStock(variant.id, baseQuantity, 'SUBTRACT', tx);
        calculatedSubTotal = calculatedSubTotal.add(itemSubTotal);

        // Calculate replacement purchase cost per sold unit at this exact moment
        const costPriceSnapshot = variant.currentPurchasePrice.mul(conversionFactor);

        preparedItems.push({
          variantId: variant.id,
          unitName: item.unitName || variant.baseUnitName,
          conversionFactor,
          quantity,
          baseQuantity,
          unitPrice,
          costPriceSnapshot,
          subTotal: itemSubTotal,
        });
      }

      // 3. Financial calculations
      const discount = new Prisma.Decimal(data.discount || 0);
      const grandTotal = calculatedSubTotal.sub(discount);
      if (grandTotal.lessThan(0)) {
        throw new AppError('Discount cannot exceed subtotal', 400);
      }

      const paidAmount = new Prisma.Decimal(data.paidAmount);

      // Walk-in / Unregistered customer constraint
      if (!customer) {
        if (paidAmount.lessThan(grandTotal)) {
          throw new AppError(
            `Walk-in customer must pay full amount of ৳${grandTotal}. Remaining due of ৳${grandTotal.sub(paidAmount)} requires registering the customer in Khata.`,
            400
          );
        }
      }

      const dueAmount = grandTotal.sub(paidAmount);
      const invoiceNumber = await this.generateInvoiceNumber(tx);

      // 4. Create Sale Record
      const sale = await salesRepository.create(
        {
          invoiceNumber,
          saleType: data.saleType,
          customer: customer ? { connect: { id: customer.id } } : undefined,
          subTotal: calculatedSubTotal,
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
              unitPrice: item.unitPrice,
              costPriceSnapshot: item.costPriceSnapshot,
              subTotal: item.subTotal,
            })),
          },
        },
        tx
      );

      // 5. Atomic Customer Khata / Ledger update
      let updatedCustomerDue = null;
      if (customer) {
        const dueDelta = grandTotal.sub(paidAmount);
        const updatedCustomer = await customerRepository.updateDue(customer.id, dueDelta, tx);
        updatedCustomerDue = updatedCustomer.currentDue;

        await customerRepository.createLedgerEntry(
          {
            customer: { connect: { id: customer.id } },
            sale: { connect: { id: sale.id } },
            entryType: CustomerLedgerType.SALE_DUE,
            debit: grandTotal,
            credit: paidAmount,
            balanceAfter: updatedCustomerDue,
            note: `Sale Invoice #${invoiceNumber}`,
          },
          tx
        );
      }

      return {
        sale,
        customerDue: updatedCustomerDue,
      };
    });
  }

  /**
   * Daily invoice number generator: INV-YYYYMMDD-0001
   */
  private async generateInvoiceNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const { startOfDay, endOfDay } = getDayBoundaries();
    const todayCount = await salesRepository.countSalesToday(startOfDay, endOfDay, tx);

    const dateStr = startOfDay.toISOString().slice(0, 10).replace(/-/g, '');
    const sequenceStr = String(todayCount + 1).padStart(4, '0');

    return `INV-${dateStr}-${sequenceStr}`;
  }

  /**
   * List sales invoices with filtering & pagination
   */
  async getSales(query: {
    customerId?: string;
    saleType?: SaleType;
    invoiceNumber?: string;
    startDate?: string;
    endDate?: string;
  } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.SaleWhereInput = {};

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.saleType) {
      where.saleType = query.saleType;
    }

    if (query.invoiceNumber) {
      where.invoiceNumber = { contains: query.invoiceNumber, mode: 'insensitive' };
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

    const [total, sales] = await Promise.all([
      salesRepository.count(where),
      salesRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      sales,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get single sale invoice by ID
   */
  async getSaleById(id: string) {
    const sale = await salesRepository.findById(id);

    if (!sale) {
      throw new AppError('Sale invoice not found', 404);
    }

    return sale;
  }

  /**
   * Get formatted receipt for printing
   */
  async getSaleReceipt(id: string) {
    return await this.generatePrintInvoice(id);
  }

  /**
   * Thermal Print / Official Invoice formatting for Idris Brothers
   */
  async generatePrintInvoice(id: string) {
    const sale = await this.getSaleById(id);

    const storeInfo = {
      storeName: 'ইদ্রিস ব্রাদার্স',
      tagline: 'পাইকারি ও খুচরা মসলা এবং মুদি মাল বিক্রয় কেন্দ্র',
      market: 'মরিচপট্টি, বড় বাজার, ফেনী',
      phone: '০১৭১১-XXXXXX, ০১৮১১-XXXXXX',
    };

    let customerInfo = null;
    let customerPreviousDue = new Prisma.Decimal(0);
    let customerCurrentTotalDue = new Prisma.Decimal(0);

    if (sale.customer) {
      customerInfo = {
        name: sale.customer.name,
        phone: sale.customer.phone || 'N/A',
        address: sale.customer.address || 'N/A',
        type: sale.saleType === 'WHOLESALE' ? 'পাইকারি গ্রাহক' : 'খুচরা গ্রাহক',
      };

      customerCurrentTotalDue = sale.customer.currentDue;
      // Previous due before this transaction = currentDue - (grandTotal - paidAmount)
      const thisInvoiceDueDelta = sale.grandTotal.sub(sale.paidAmount);
      customerPreviousDue = customerCurrentTotalDue.sub(thisInvoiceDueDelta);
    }

    const items = sale.items.map((item, idx) => {
      const baseName = item.variant.product.banglaName || item.variant.product.name;
      const variantSuffix = item.variant.variantName !== 'Default' ? ` (${item.variant.variantName})` : '';
      return {
        sl: idx + 1,
        productName: `${baseName}${variantSuffix}`,
        unitName: item.unitName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subTotal: item.subTotal,
      };
    });

    return {
      store: storeInfo,
      invoice: {
        invoiceNumber: sale.invoiceNumber,
        date: sale.createdAt.toLocaleDateString('bn-BD', { timeZone: 'Asia/Dhaka' }),
        time: sale.createdAt.toLocaleTimeString('bn-BD', { timeZone: 'Asia/Dhaka' }),
        saleType: sale.saleType === 'WHOLESALE' ? 'পাইকারি (WHOLESALE)' : 'খুচরা (RETAIL)',
        status: sale.status,
      },
      customer: customerInfo,
      items,
      billing: {
        subTotal: sale.subTotal,
        discount: sale.discount,
        grandTotal: sale.grandTotal,
        paidAmount: sale.paidAmount,
        thisInvoiceDue: sale.dueAmount,
        previousDue: customerInfo ? customerPreviousDue : new Prisma.Decimal(0),
        totalCurrentDue: customerInfo ? customerCurrentTotalDue : new Prisma.Decimal(0),
      },
      footerNote: 'ধন্যবাদ, আবার আসবেন!',
    };
  }
}

export const salesService = new SalesService();
