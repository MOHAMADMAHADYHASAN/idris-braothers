import { Prisma, CustomerLedgerType, SaleType } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { salesRepository } from './sales.repository';
import { inventoryRepository } from '../inventory/inventory.repository';
import { customerRepository } from '../customers/customers.repository';
import { CreateSaleInput } from './sales.validation';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import { getDayBoundaries, buildDateRangeFilter } from '../../common/utils/dateUtils';
import { generateDailySequenceCode } from '../../common/utils/codeGenerator';

export class SalesService {
  /**
   * Helper to generate unique invoice number: INV-YYMMDD-XXXX
   */
  private async generateInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
    const { startOfDay, endOfDay } = getDayBoundaries();
    const countToday = await salesRepository.countSalesToday(startOfDay, endOfDay, tx);
    return generateDailySequenceCode('INV', countToday);
  }

  /**
   * Process POS Checkout / Sale Transaction (খুচরা বা পাইকারি বিক্রয়)
   */
  async createSale(data: CreateSaleInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate customer if provided
      let customer = null;
      if (data.customerId) {
        customer = await customerRepository.findById(data.customerId, tx);
        if (!customer || !customer.isActive) {
          throw new AppError('Customer not found or inactive', 404);
        }
      }

      // 2. Validate and process each item
      let calculatedSubTotal = new Prisma.Decimal(0);
      const preparedItems: {
        productId: string;
        unitName: string;
        conversionFactor: Prisma.Decimal;
        quantity: Prisma.Decimal;
        baseQuantity: Prisma.Decimal;
        unitPrice: Prisma.Decimal;
        costPriceSnapshot: Prisma.Decimal;
        subTotal: Prisma.Decimal;
      }[] = [];

      for (const item of data.items) {
        const product = await inventoryRepository.findById(item.productId, tx);
        if (!product || !product.isActive) {
          throw new AppError(`Product with ID ${item.productId} not found or inactive`, 404);
        }

        const conversionFactor = new Prisma.Decimal(item.conversionFactor || 1);
        let quantity: Prisma.Decimal;
        let baseQuantity: Prisma.Decimal;
        let unitPrice: Prisma.Decimal;
        let itemSubTotal: Prisma.Decimal;

        if (item.customTotalPrice !== undefined && item.customTotalPrice > 0) {
          // Reverse Price-to-Weight Calculation (টাকার অঙ্কে বিক্রি, e.g. ২০ টাকার এলাচ)
          itemSubTotal = new Prisma.Decimal(item.customTotalPrice);

          if (item.unitPrice !== undefined) {
            unitPrice = new Prisma.Decimal(item.unitPrice);
          } else {
            unitPrice = data.saleType === 'WHOLESALE' ? product.wholesalePrice : product.retailPrice;
          }

          // Calculate price per base unit and back-calculate exact base quantity to 4 decimal places
          const pricePerBaseUnit = unitPrice.div(conversionFactor);
          baseQuantity = itemSubTotal.div(pricePerBaseUnit).toDecimalPlaces(4);
          quantity = baseQuantity.div(conversionFactor).toDecimalPlaces(4);
        } else if (item.quantity !== undefined && item.quantity > 0) {
          // Standard Unit/Quantity Sale Mode
          quantity = new Prisma.Decimal(item.quantity);
          baseQuantity = quantity.mul(conversionFactor);

          if (item.unitPrice !== undefined) {
            unitPrice = new Prisma.Decimal(item.unitPrice);
          } else {
            unitPrice = data.saleType === 'WHOLESALE' ? product.wholesalePrice : product.retailPrice;
          }

          itemSubTotal = quantity.mul(unitPrice);
        } else {
          throw new AppError(
            `Either quantity or customTotalPrice must be provided for product "${product.name}"`,
            400
          );
        }

        // Check inventory stock
        if (product.stockQuantity.lessThan(baseQuantity)) {
          throw new AppError(
            `Insufficient stock for "${product.name}". Required: ${baseQuantity} ${product.baseUnitName}, Available: ${product.stockQuantity} ${product.baseUnitName}`,
            400
          );
        }

        // Deduct inventory in base unit
        await inventoryRepository.adjustStock(product.id, baseQuantity, 'SUBTRACT', tx);
        calculatedSubTotal = calculatedSubTotal.add(itemSubTotal);

        // Calculate replacement purchase cost per sold unit at this exact moment
        const costPriceSnapshot = product.currentPurchasePrice.mul(conversionFactor);

        preparedItems.push({
          productId: product.id,
          unitName: item.unitName || product.baseUnitName,
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
              productId: item.productId,
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
            balanceAfter: updatedCustomer.currentDue,
            note: `বিক্রয় রসিদ #${invoiceNumber}`,
          },
          tx
        );
      }

      return {
        ...sale,
        customerCurrentDue: updatedCustomerDue,
      };
    });
  }

  /**
   * Get sales invoices with filters and pagination
   */
  async getSales(query: {
    customerId?: string;
    saleType?: string;
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
      where.saleType = query.saleType as SaleType;
    }
    if (query.invoiceNumber) {
      where.invoiceNumber = { contains: query.invoiceNumber, mode: 'insensitive' };
    }

    const dateFilter = buildDateRangeFilter(query.startDate, query.endDate);
    if (dateFilter) {
      where.createdAt = dateFilter;
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
   * Get single invoice details by ID
   */
  async getSaleById(id: string) {
    const sale = await salesRepository.findById(id);
    if (!sale) {
      throw new AppError('Sale invoice not found', 404);
    }
    return sale;
  }

  /**
   * Get formatted POS thermal receipt (৫৬ মিমি / ৮০ মিমি প্রিন্টার ও ভাউচার রসিদ)
   */
  async getSaleReceipt(id: string) {
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

    const items = sale.items.map((item, idx) => ({
      sl: idx + 1,
      productName: item.product.banglaName || item.product.name,
      unitName: item.unitName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subTotal: item.subTotal,
    }));

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
