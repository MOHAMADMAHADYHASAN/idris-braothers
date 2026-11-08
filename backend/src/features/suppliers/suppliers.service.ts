import { Prisma, SupplierLedgerType } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { supplierRepository } from './suppliers.repository';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  PaySupplierInput,
  AdjustSupplierBalanceInput,
} from './suppliers.validation';

export class SupplierService {
  /**
   * Create a new supplier/mahajan with optional opening payable
   */
  async createSupplier(data: CreateSupplierInput) {
    if (data.phone) {
      const existing = await supplierRepository.findByPhone(data.phone);
      if (existing) {
        throw new AppError(`Supplier with phone number "${data.phone}" already exists`, 409);
      }
    }

    const openingPayable = new Prisma.Decimal(data.openingPayable || 0);

    return await prisma.$transaction(async (tx) => {
      const supplier = await supplierRepository.create(
        {
          name: data.name,
          companyName: data.companyName || null,
          phone: data.phone || null,
          address: data.address || null,
          currentPayable: openingPayable,
        },
        tx
      );

      // If there is an opening balance, record an initial ledger entry
      if (!openingPayable.isZero()) {
        await supplierRepository.createLedgerEntry(
          {
            supplier: { connect: { id: supplier.id } },
            entryType: SupplierLedgerType.OPENING_BALANCE,
            credit: openingPayable.greaterThan(0) ? openingPayable : new Prisma.Decimal(0),
            debit: openingPayable.lessThan(0) ? openingPayable.abs() : new Prisma.Decimal(0),
            balanceAfter: openingPayable,
            note: openingPayable.greaterThan(0) ? 'মহাজনের পূর্বের পাওনা হিসাব শুরু' : 'মহাজনের কাছে অগ্রিম হিসাব শুরু',
          },
          tx
        );
      }

      return supplier;
    });
  }

  /**
   * Get suppliers list with search, payable filtering, and pagination
   */
  async getSuppliers(query: {
    search?: string;
    payableFilter?: 'all' | 'payableOnly' | 'advanceOnly' | 'cleared';
  } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.SupplierWhereInput = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.payableFilter === 'payableOnly') {
      where.currentPayable = { gt: 0 };
    } else if (query.payableFilter === 'advanceOnly') {
      where.currentPayable = { lt: 0 };
    } else if (query.payableFilter === 'cleared') {
      where.currentPayable = { equals: 0 };
    }

    const [total, suppliers] = await Promise.all([
      supplierRepository.count(where),
      supplierRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { currentPayable: 'desc' }, // Largest debts to suppliers first
      }),
    ]);

    return {
      suppliers,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get supplier details by ID
   */
  async getSupplierById(id: string) {
    const supplier = await supplierRepository.findByIdWithDetails(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }
    return supplier;
  }

  /**
   * Update supplier profile
   */
  async updateSupplier(id: string, data: UpdateSupplierInput) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    if (data.phone && data.phone !== supplier.phone) {
      const existing = await supplierRepository.findByPhone(data.phone);
      if (existing) {
        throw new AppError(`Supplier with phone number "${data.phone}" already exists`, 409);
      }
    }

    return await supplierRepository.update(id, {
      ...(data.name && { name: data.name }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    });
  }

  /**
   * Cash payment to Mahajan / Supplier (মহাজনকে দেনা পরিশোধ)
   */
  async paySupplier(supplierId: string, data: PaySupplierInput) {
    const supplier = await supplierRepository.findById(supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    const paymentAmount = new Prisma.Decimal(data.amount);

    return await prisma.$transaction(async (tx) => {
      // Deduct from current payable (store debt decreases)
      const updatedSupplier = await supplierRepository.updatePayable(
        supplierId,
        paymentAmount.negated(),
        tx
      );

      const ledgerEntry = await supplierRepository.createLedgerEntry(
        {
          supplier: { connect: { id: supplierId } },
          entryType: SupplierLedgerType.PAYMENT_PAID,
          debit: paymentAmount,
          credit: new Prisma.Decimal(0),
          balanceAfter: updatedSupplier.currentPayable,
          note: data.note || 'মহাজনকে নগদ দেনা পরিশোধ',
        },
        tx
      );

      return {
        supplier: updatedSupplier,
        ledgerEntry,
      };
    });
  }

  /**
   * Supplier balance manual adjustment (মহাজন থেকে ছাড় বা কমিশন সমন্বয়)
   */
  async adjustBalance(supplierId: string, data: AdjustSupplierBalanceInput) {
    const supplier = await supplierRepository.findById(supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    const delta = new Prisma.Decimal(data.amount);

    return await prisma.$transaction(async (tx) => {
      const updatedSupplier = await supplierRepository.updatePayable(supplierId, delta, tx);

      const ledgerEntry = await supplierRepository.createLedgerEntry(
        {
          supplier: { connect: { id: supplierId } },
          entryType: SupplierLedgerType.ADJUSTMENT,
          credit: delta.greaterThan(0) ? delta : new Prisma.Decimal(0),
          debit: delta.lessThan(0) ? delta.abs() : new Prisma.Decimal(0),
          balanceAfter: updatedSupplier.currentPayable,
          note: `হিসাব সমন্বয়: ${data.reason}`,
        },
        tx
      );

      return {
        supplier: updatedSupplier,
        ledgerEntry,
      };
    });
  }

  /**
   * Get complete statement history for a supplier
   */
  async getSupplierLedger(supplierId: string, query: PaginationParams) {
    await this.getSupplierById(supplierId);

    const { page, limit, skip } = getPagination(query, 30);
    const where: Prisma.SupplierLedgerWhereInput = { supplierId };

    const [total, entries] = await Promise.all([
      supplierRepository.countLedgerEntries(where),
      supplierRepository.findLedgerEntries({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      entries,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}

export const supplierService = new SupplierService();
