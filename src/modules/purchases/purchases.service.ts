import { Prisma, PurchaseStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { CreatePurchaseInput, GetPurchasesQueryInput } from './purchases.validation';

export class PurchaseService {
  /**
   * Process Stock-In Purchase Chalan using Prisma $transaction:
   * 1. Validates supplier existence
   * 2. Atomically increments product inventory
   * 3. Updates latest costPrice of each product
   * 4. Creates Purchase and Line Items
   * 5. If store leaves a balance due, increments supplier debt and creates a SupplierLedger entry
   */
  async processPurchase(data: CreatePurchaseInput) {
    return await prisma.$transaction(async (tx) => {
      // Step 1: Verify supplier
      const supplier = await tx.supplier.findUnique({
        where: { id: data.supplierId },
      });

      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      let subTotal = new Prisma.Decimal(0);
      const purchaseItemsToCreate: Array<{
        productId: string;
        quantity: Prisma.Decimal;
        unitCost: Prisma.Decimal;
        subTotal: Prisma.Decimal;
      }> = [];

      // Step 2: Iterate through items, increment stock & update cost price
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product with ID ${item.productId} not found`, 404);
        }

        const quantity = new Prisma.Decimal(item.quantity);
        const unitCost = new Prisma.Decimal(item.unitCost);
        const lineTotal = unitCost.mul(quantity);
        subTotal = subTotal.add(lineTotal);

        // Increment stock and update costPrice for accurate profit margins
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: quantity },
            costPrice: unitCost,
          },
        });

        purchaseItemsToCreate.push({
          productId: product.id,
          quantity,
          unitCost,
          subTotal: lineTotal,
        });
      }

      // Step 3: Financials
      const discount = new Prisma.Decimal(data.discount || 0);
      const grandTotal = subTotal.sub(discount);
      const paidAmount = new Prisma.Decimal(data.paidAmount);
      const diff = grandTotal.sub(paidAmount);
      const dueAmount = diff.greaterThan(0) ? diff : new Prisma.Decimal(0);

      let status: PurchaseStatus = PurchaseStatus.COMPLETED;
      if (dueAmount.greaterThan(0)) {
        status = paidAmount.greaterThan(0) ? PurchaseStatus.PARTIAL : PurchaseStatus.DUE;
      }

      // Generate Chalan Number if not manually supplied
      const purchaseNumber =
        data.purchaseNumber ||
        `PUR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Step 4: Record the Purchase
      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierId: data.supplierId,
          subTotal,
          discount,
          grandTotal,
          paidAmount,
          dueAmount,
          paymentMethod: data.paymentMethod,
          status,
          items: {
            create: purchaseItemsToCreate,
          },
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: {
                select: { id: true, name: true, barcode: true, unit: true, stock: true },
              },
            },
          },
        },
      });

      // Step 5: If there is remaining debt to supplier, update supplier ledger
      if (dueAmount.greaterThan(0)) {
        const newTotalPayable = supplier.currentPayable.add(dueAmount);

        await tx.supplier.update({
          where: { id: data.supplierId },
          data: { currentPayable: newTotalPayable },
        });

        // CREDIT increases store's liability/debt to the supplier
        await tx.supplierLedger.create({
          data: {
            supplierId: data.supplierId,
            purchaseId: purchase.id,
            type: 'CREDIT',
            amount: dueAmount,
            balanceAfter: newTotalPayable,
            note: `Due on Chalan #${purchaseNumber}`,
            paymentMethod: data.paymentMethod,
          },
        });
      }

      return purchase;
    });
  }

  /**
   * Get purchase history
   */
  async getPurchases(query: GetPurchasesQueryInput) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseWhereInput = {};

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [total, purchases] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: {
            select: { id: true, name: true, companyName: true, phone: true },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    return {
      purchases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get purchase chalan details
   */
  async getPurchaseByIdOrNumber(identifier: string) {
    const purchase = await prisma.purchase.findFirst({
      where: {
        OR: [{ id: identifier }, { purchaseNumber: identifier }],
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
        ledgerEntries: true,
      },
    });

    if (!purchase) {
      throw new AppError('Purchase chalan not found', 404);
    }

    return purchase;
  }
}

export const purchaseService = new PurchaseService();
