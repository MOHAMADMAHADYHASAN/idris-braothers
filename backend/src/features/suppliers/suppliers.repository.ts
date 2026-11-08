import { Prisma, Supplier, SupplierLedger } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export class SupplierRepository extends BaseRepository {

  async create(data: Prisma.SupplierCreateInput, tx?: Prisma.TransactionClient): Promise<Supplier> {
    return await this.getDb(tx).supplier.create({ data });
  }

  async findByPhone(phone: string, tx?: Prisma.TransactionClient): Promise<Supplier | null> {
    return await this.getDb(tx).supplier.findUnique({
      where: { phone },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<Supplier | null> {
    return await this.getDb(tx).supplier.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id: string) {
    return await prisma.supplier.findUnique({
      where: { id },
      include: {
        ledger: {
          take: 30,
          orderBy: { createdAt: 'desc' },
        },
        purchases: {
          take: 10,
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
  }

  async findMany(params: {
    where?: Prisma.SupplierWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.SupplierOrderByWithRelationInput;
  }): Promise<Supplier[]> {
    return await prisma.supplier.findMany(params);
  }

  async count(where?: Prisma.SupplierWhereInput): Promise<number> {
    return await prisma.supplier.count({ where });
  }

  async update(id: string, data: Prisma.SupplierUpdateInput, tx?: Prisma.TransactionClient): Promise<Supplier> {
    return await this.getDb(tx).supplier.update({
      where: { id },
      data,
    });
  }

  async updatePayable(id: string, payableDelta: Prisma.Decimal, tx?: Prisma.TransactionClient): Promise<Supplier> {
    return await this.getDb(tx).supplier.update({
      where: { id },
      data: {
        currentPayable: { increment: payableDelta },
      },
    });
  }

  async createLedgerEntry(
    data: Prisma.SupplierLedgerCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<SupplierLedger> {
    return await this.getDb(tx).supplierLedger.create({ data });
  }

  async findLedgerEntries(params: {
    where: Prisma.SupplierLedgerWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.SupplierLedgerOrderByWithRelationInput;
  }): Promise<SupplierLedger[]> {
    return await prisma.supplierLedger.findMany(params);
  }

  async countLedgerEntries(where: Prisma.SupplierLedgerWhereInput): Promise<number> {
    return await prisma.supplierLedger.count({ where });
  }
}

export const supplierRepository = new SupplierRepository();
