import { Prisma, SaleStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { CreateSaleInput, GetSalesQueryInput } from './sales.validation';

export class SalesService {
  /**
   * Secure Checkout Engine using Prisma $transaction
   * Simultaneously:
   * 1. Validates stock availability
   * 2. Decrements product inventory
   * 3. Generates the Sale & Line Items
   * 4. Updates Customer Due & creates Customer Ledger entry if due (Baki) exists
   */
  async processSale(data: CreateSaleInput) {
    return await prisma.$transaction(async (tx) => {
      let subTotal = new Prisma.Decimal(0);
      const saleItemsToCreate: Array<{
        productId: string;
        quantity: Prisma.Decimal;
        unitPrice: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        subTotal: Prisma.Decimal;
      }> = [];

      // Step 1: Verify each product, check stock, and deduct inventory
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new AppError(
            `Product with ID ${item.productId} is not available for sale`,
            400
          );
        }

        const requestedQty = new Prisma.Decimal(item.quantity);

        if (product.stock.lessThan(requestedQty)) {
          throw new AppError(
            `Insufficient stock for "${product.name}". Available: ${product.stock} ${product.unit}, Requested: ${requestedQty}`,
            400
          );
        }

        // Deduct inventory atomically
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: requestedQty },
          },
        });

        // Price snapshots
        const lineTotal = product.sellingPrice.mul(requestedQty);
        subTotal = subTotal.add(lineTotal);

        saleItemsToCreate.push({
          productId: product.id,
          quantity: requestedQty,
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          subTotal: lineTotal,
        });
      }

      // Step 2: Calculate financials
      const discount = new Prisma.Decimal(data.discount || 0);
      const grandTotal = subTotal.sub(discount);

      if (grandTotal.isNegative()) {
        throw new AppError('Discount cannot exceed the subtotal amount', 400);
      }

      const paidAmount = new Prisma.Decimal(data.paidAmount);
      const diff = grandTotal.sub(paidAmount);
      const dueAmount = diff.greaterThan(0) ? diff : new Prisma.Decimal(0);

      // Business Rule: If there is due (Baki), customer details are mandatory
      if (dueAmount.greaterThan(0) && !data.customerId) {
        throw new AppError(
          'Customer selection is required when creating a sale with remaining due (Baki)',
          400
        );
      }

      // Determine Sale Status
      let status: SaleStatus = SaleStatus.COMPLETED;
      if (dueAmount.greaterThan(0)) {
        status = paidAmount.greaterThan(0) ? SaleStatus.PARTIAL : SaleStatus.DUE;
      }

      // Generate invoice number: INV-YYMMDD-RANDOM
      const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `INV-${datePart}-${randomPart}`;

      // Step 3: Record the Sale and its line items
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: data.customerId,
          subTotal,
          discount,
          grandTotal,
          paidAmount,
          dueAmount,
          paymentMethod: data.paymentMethod,
          status,
          items: {
            create: saleItemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, barcode: true, unit: true },
              },
            },
          },
          customer: true,
        },
      });

      // Step 4: If there is Due, record in Customer Ledger & adjust customer balance
      if (dueAmount.greaterThan(0) && data.customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: data.customerId },
        });

        if (!customer) {
          throw new AppError('Customer profile not found', 404);
        }

        const newTotalDue = customer.currentDue.add(dueAmount);

        // Update customer's running due balance
        await tx.customer.update({
          where: { id: data.customerId },
          data: { currentDue: newTotalDue },
        });

        // Insert into Customer Ledger for financial auditing
        await tx.customerLedger.create({
          data: {
            customerId: data.customerId,
            saleId: sale.id,
            type: 'DEBIT',
            amount: dueAmount,
            balanceAfter: newTotalDue,
            note: `Due for invoice #${invoiceNumber}`,
            paymentMethod: data.paymentMethod,
          },
        });
      }

      return sale;
    });
  }

  /**
   * Get list of sales with filters (date range, customer, payment status)
   */
  async getSales(query: GetSalesQueryInput) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = {};

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [total, sales] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, phone: true },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    return {
      sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get complete sale and invoice details by ID or Invoice Number
   */
  async getSaleByIdOrInvoice(identifier: string) {
    const sale = await prisma.sale.findFirst({
      where: {
        OR: [{ id: identifier }, { invoiceNumber: identifier }],
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, barcode: true, unit: true },
            },
          },
        },
        ledgerEntries: true,
      },
    });

    if (!sale) {
      throw new AppError('Sale record not found', 404);
    }

    return sale;
  }
}

export const salesService = new SalesService();
