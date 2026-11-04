import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  RecordSupplierPaymentInput,
} from './suppliers.validation';

export class SupplierService {
  /**
   * Add a new distributor / wholesaler / supplier
   */
  async createSupplier(data: CreateSupplierInput) {
    const existing = await prisma.supplier.findUnique({
      where: { phone: data.phone },
    });

    if (existing) {
      throw new AppError(`Supplier with phone ${data.phone} already exists`, 409);
    }

    return await prisma.supplier.create({
      data: {
        name: data.name,
        companyName: data.companyName,
        phone: data.phone,
        address: data.address,
      },
    });
  }

  /**
   * Get all suppliers (sorted by highest debt/payable first)
   */
  async getSuppliers(query: { search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, suppliers] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { currentPayable: 'desc' }, // Store owner sees highest debts first
      }),
    ]);

    return {
      suppliers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get supplier details and ledger history
   */
  async getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        ledger: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        purchases: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            purchaseNumber: true,
            grandTotal: true,
            paidAmount: true,
            dueAmount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new AppError('Supplier profile not found', 404);
    }

    return supplier;
  }

  /**
   * Pay money to supplier (মহাজন দেনা পরিশোধ)
   */
  async recordPayment(supplierId: string, data: RecordSupplierPaymentInput) {
    return await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({
        where: { id: supplierId },
      });

      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const paymentAmount = new Prisma.Decimal(data.amount);
      const newTotalPayable = supplier.currentPayable.sub(paymentAmount);

      const updatedSupplier = await tx.supplier.update({
        where: { id: supplierId },
        data: { currentPayable: newTotalPayable },
      });

      // DEBIT reduces debt to supplier
      const ledgerEntry = await tx.supplierLedger.create({
        data: {
          supplierId,
          type: 'DEBIT',
          amount: paymentAmount,
          balanceAfter: newTotalPayable,
          note: data.note || 'Payment made to supplier',
          paymentMethod: data.paymentMethod,
        },
      });

      return {
        supplier: updatedSupplier,
        payment: ledgerEntry,
      };
    });
  }

  /**
   * Update supplier profile
   */
  async updateSupplier(id: string, data: UpdateSupplierInput) {
    await this.getSupplierById(id);

    return await prisma.supplier.update({
      where: { id },
      data,
    });
  }
}

export const supplierService = new SupplierService();
