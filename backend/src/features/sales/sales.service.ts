import { Prisma, SaleType, CustomerLedgerType, SaleStatus } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { salesRepository } from './sales.repository';
import { inventoryRepository } from '../inventory/inventory.repository';
import { customerRepository } from '../customers/customers.repository';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import { getDayBoundaries } from '../../common/utils/dateUtils';
import { resolveDateFilter, ResolvedDateRange } from '../../common/utils/dateFilter';
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
   * Strictly timezone-safe (Asia/Dhaka UTC+06:00) with automatic previous period comparison
   */
  async getSales(query: {
    customerId?: string;
    saleType?: SaleType;
    invoiceNumber?: string;
    filter?: string;
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

    let dateRange: ResolvedDateRange | null = null;
    if (query.filter || query.startDate || query.endDate) {
      dateRange = resolveDateFilter({
        filter: query.filter,
        startDate: query.startDate,
        endDate: query.endDate,
      });

      if (dateRange.filter !== 'all') {
        where.createdAt = {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        };
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

    // Optional period growth comparison for dashboard/analytics
    let periodComparison: {
      currentRevenue: number;
      prevRevenue: number;
      growthPercent: number | null;
      currentOrders: number;
      prevOrders: number;
    } | null = null;

    if (dateRange && dateRange.filter !== 'all') {
      const prevWhere: Prisma.SaleWhereInput = {
        ...where,
        createdAt: {
          gte: dateRange.prevStartDate,
          lte: dateRange.prevEndDate,
        },
        status: SaleStatus.COMPLETED,
      };

      const [currentAgg, prevAgg] = await Promise.all([
        prisma.sale.aggregate({
          where: { ...where, status: SaleStatus.COMPLETED },
          _sum: { grandTotal: true },
          _count: { id: true },
        }),
        prisma.sale.aggregate({
          where: prevWhere,
          _sum: { grandTotal: true },
          _count: { id: true },
        }),
      ]);

      const currentRev = Number(currentAgg._sum.grandTotal || 0);
      const prevRev = Number(prevAgg._sum.grandTotal || 0);
      let growthPercent: number | null = null;
      if (prevRev > 0) {
        growthPercent = Number((((currentRev - prevRev) / prevRev) * 100).toFixed(1));
      }

      periodComparison = {
        currentRevenue: currentRev,
        prevRevenue: prevRev,
        growthPercent,
        currentOrders: currentAgg._count.id,
        prevOrders: prevAgg._count.id,
      };
    }

    return {
      sales,
      meta: buildPaginationMeta(total, page, limit),
      dateRange: dateRange
        ? {
            filter: dateRange.filter,
            startYmd: dateRange.startYmd,
            endYmd: dateRange.endYmd,
            numDays: dateRange.numDays,
          }
        : null,
      periodComparison,
    };
  }

  /**
   * Get single sale invoice by ID or Invoice Number
   */
  async getSaleById(id: string) {
    if (!id || id === 'undefined') {
      throw new AppError('ইনভয়েস আইডি বা মেমো নম্বর প্রদান করা আবশ্যক', 400);
    }

    let sale = await salesRepository.findById(id);

    // Fallback search by invoiceNumber if not found by UUID
    if (!sale) {
      sale = await salesRepository.findByInvoiceNumber(id);
    }

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

  /**
   * Cancel / Void a completed sale invoice.
   * Atomic operations inside Prisma $transaction:
   * 1. Check sale exists and is not already CANCELLED
   * 2. Revert inventory: add back baseQuantity to each ProductVariant
   * 3. If credit sale with customer, decrement customer's currentDue and record adjustment ledger entry
   * 4. Update sale status to CANCELLED and save cancellation reason
   */
  async cancelSale(id: string, reason?: string) {
    const sale = await salesRepository.findById(id);

    if (!sale) {
      throw new AppError('Sale invoice not found', 404);
    }

    if (sale.status === SaleStatus.CANCELLED) {
      throw new AppError('Sale invoice is already cancelled', 400);
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Revert inventory stock for all items
      for (const item of sale.items) {
        await inventoryRepository.adjustStock(item.variantId, item.baseQuantity, 'ADD', tx);
      }

      // 2. Adjust customer dues if this invoice had unpaid credit
      let updatedCustomerDue = null;
      if (sale.customerId && sale.dueAmount.greaterThan(0)) {
        // Decrease customer due by dueAmount
        const updatedCustomer = await customerRepository.updateDue(
          sale.customerId,
          sale.dueAmount.negated(),
          tx
        );
        updatedCustomerDue = updatedCustomer.currentDue;

        await customerRepository.createLedgerEntry(
          {
            customer: { connect: { id: sale.customerId } },
            sale: { connect: { id: sale.id } },
            entryType: CustomerLedgerType.ADJUSTMENT,
            debit: new Prisma.Decimal(0),
            credit: sale.dueAmount,
            balanceAfter: updatedCustomerDue,
            note: `মেমো বাতিলজনিত কারণে বকেয়া সমন্বয় (#${sale.invoiceNumber})${reason ? `: ${reason}` : ''}`,
          },
          tx
        );
      }

      // 3. Mark sale as CANCELLED
      const noteUpdate = reason ? `${sale.note ? sale.note + ' | ' : ''}বাতিলের কারণ: ${reason}` : sale.note;
      const cancelledSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: SaleStatus.CANCELLED,
          note: noteUpdate,
        },
        include: {
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  variantName: true,
                  sku: true,
                  barcode: true,
                  baseUnitName: true,
                  allowDecimalQty: true,
                  product: {
                    select: { id: true, name: true, banglaName: true },
                  },
                },
              },
            },
          },
          customer: true,
        },
      });

      return {
        sale: cancelledSale,
        customerDue: updatedCustomerDue,
      };
    });
  }

  /**
   * Process Partial / Full Sales Return
   * 1. Validate returned items & quantities (must not exceed sold quantities)
   * 2. Transactionally add returned baseQuantity back to inventory stock
   * 3. Update or adjust SaleItem line quantities and sub-totals
   * 4. Deduct refund from customer dues (if credit) or cash paid
   * 5. Record CustomerLedger adjustment entry if customer due was reduced
   */
  async returnSaleItems(data: {
    saleId: string;
    items: { saleItemId: string; returnQuantity: number }[];
    refundMethod: 'CASH' | 'CUSTOMER_DUE_ADJUSTMENT';
    reason?: string;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new AppError('কমপক্ষে একটি পণ্য ফেরত হিসেবে নির্বাচন করতে হবে', 400);
    }

    const sale = await salesRepository.findById(data.saleId);
    if (!sale) {
      throw new AppError('Sale invoice not found', 404);
    }

    if (sale.status === SaleStatus.CANCELLED) {
      throw new AppError('বাতিলকৃত মেমো থেকে পণ্য ফেরত নেওয়া সম্ভব নয়', 400);
    }

    return await prisma.$transaction(async (tx) => {
      let totalRefundAmount = new Prisma.Decimal(0);
      const returnLogMessages: string[] = [];

      for (const reqItem of data.items) {
        const saleItem = sale.items.find((i) => i.id === reqItem.saleItemId);
        if (!saleItem) {
          throw new AppError(`আইটেমটি এই মেমোর অন্তর্ভুক্ত নয় (${reqItem.saleItemId})`, 400);
        }

        const returnQty = new Prisma.Decimal(reqItem.returnQuantity);
        if (returnQty.lessThanOrEqualTo(0)) {
          continue; // skip zero quantities
        }

        if (returnQty.greaterThan(saleItem.quantity)) {
          throw new AppError(
            `ফেরতের পরিমাণ (${returnQty}) বিক্রিত পরিমাণের (${saleItem.quantity}) চেয়ে বেশি হতে পারে না`,
            400
          );
        }

        // Base unit quantity to return to inventory
        const returnBaseQty = returnQty.mul(saleItem.conversionFactor);
        await inventoryRepository.adjustStock(saleItem.variantId, returnBaseQty, 'ADD', tx);

        // Refund calculation for this item
        const itemRefundAmount = returnQty.mul(saleItem.unitPrice);
        totalRefundAmount = totalRefundAmount.add(itemRefundAmount);

        // Remaining quantities for this line item
        const newQty = saleItem.quantity.sub(returnQty);
        const newBaseQty = saleItem.baseQuantity.sub(returnBaseQty);
        const newSubTotal = saleItem.subTotal.sub(itemRefundAmount);

        await tx.saleItem.update({
          where: { id: saleItem.id },
          data: {
            quantity: newQty,
            baseQuantity: newBaseQty,
            subTotal: newSubTotal,
          },
        });

        const prodName = saleItem.variant?.product?.banglaName || saleItem.variant?.product?.name || saleItem.unitName;
        returnLogMessages.push(
          `${prodName} ${returnQty.toString()} ${saleItem.unitName} (৳${itemRefundAmount.toFixed(2)})`
        );
      }

      if (totalRefundAmount.equals(0)) {
        throw new AppError('ফেরতের জন্য কমপক্ষে একটি পণ্যের পরিমাণ ১ বা তার বেশি হতে হবে', 400);
      }

      // Financial adjustments
      const newSubTotal = sale.subTotal.sub(totalRefundAmount);
      const newGrandTotal = Prisma.Decimal.max(new Prisma.Decimal(0), newSubTotal.sub(sale.discount));

      let newPaidAmount = sale.paidAmount;
      let newDueAmount = sale.dueAmount;
      let updatedCustomerDue: Prisma.Decimal | null = null;

      if (data.refundMethod === 'CUSTOMER_DUE_ADJUSTMENT' && sale.customerId) {
        // Reduce customer ledger due
        const customer = await customerRepository.findById(sale.customerId, tx);
        if (customer) {
          const dueDeduction = Prisma.Decimal.min(totalRefundAmount, customer.currentDue);
          if (dueDeduction.greaterThan(0)) {
            const updatedCustomer = await customerRepository.updateDue(
              sale.customerId,
              dueDeduction.negated(),
              tx
            );
            updatedCustomerDue = updatedCustomer.currentDue;

            await customerRepository.createLedgerEntry(
              {
                customer: { connect: { id: sale.customerId } },
                sale: { connect: { id: sale.id } },
                entryType: CustomerLedgerType.ADJUSTMENT,
                debit: new Prisma.Decimal(0),
                credit: dueDeduction,
                balanceAfter: updatedCustomerDue,
                note: `পণ্য ফেরতজনিত বকেয়া সমন্বয় (মেমো #${sale.invoiceNumber}): ${returnLogMessages.join(', ')}`,
              },
              tx
            );
          }
        }

        // Adjust due on this sale
        newDueAmount = Prisma.Decimal.max(new Prisma.Decimal(0), sale.dueAmount.sub(totalRefundAmount));
      } else {
        // CASH refund: deducted from store's paid cash on this memo
        newPaidAmount = Prisma.Decimal.max(new Prisma.Decimal(0), sale.paidAmount.sub(totalRefundAmount));
      }

      // Check if all items in the invoice are now 0
      const remainingItems = await tx.saleItem.findMany({
        where: { saleId: sale.id },
      });
      const allZero = remainingItems.every((i) => i.quantity.equals(0));
      const nextStatus = allZero ? SaleStatus.CANCELLED : sale.status;

      const returnSummaryNote = `[ফেরত: ${returnLogMessages.join(', ')} | রিফান্ড ৳${totalRefundAmount.toFixed(2)} (${
        data.refundMethod === 'CASH' ? 'নগদ রিফান্ড' : 'বকেয়া সমন্বয়'
      })${data.reason ? ` - কারণ: ${data.reason}` : ''}]`;

      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          subTotal: newSubTotal,
          grandTotal: newGrandTotal,
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: nextStatus,
          note: sale.note ? `${sale.note} | ${returnSummaryNote}` : returnSummaryNote,
        },
        include: {
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  variantName: true,
                  sku: true,
                  barcode: true,
                  baseUnitName: true,
                  allowDecimalQty: true,
                  product: {
                    select: { id: true, name: true, banglaName: true },
                  },
                },
              },
            },
          },
          customer: true,
        },
      });

      return {
        sale: updatedSale,
        totalRefundAmount,
        refundMethod: data.refundMethod,
        customerDue: updatedCustomerDue,
      };
    });
  }
}

export const salesService = new SalesService();
