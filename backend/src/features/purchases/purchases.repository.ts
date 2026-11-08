import { Prisma, Purchase, PurchaseItem } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export class PurchasesRepository extends BaseRepository {

  async create(data: Prisma.PurchaseCreateInput, tx?: Prisma.TransactionClient): Promise<Purchase & { items: PurchaseItem[] }> {
    return await this.getDb(tx).purchase.create({
      data,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, banglaName: true, baseUnitName: true },
            },
          },
        },
        supplier: true,
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    return await this.getDb(tx).purchase.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, banglaName: true, baseUnitName: true },
            },
          },
        },
        supplier: true,
        ledgerEntries: true,
      },
    });
  }

  async findByPurchaseNumber(purchaseNumber: string) {
    return await prisma.purchase.findUnique({
      where: { purchaseNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, banglaName: true, baseUnitName: true },
            },
          },
        },
        supplier: true,
      },
    });
  }

  async findMany(params: {
    where?: Prisma.PurchaseWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.PurchaseOrderByWithRelationInput;
  }) {
    return await prisma.purchase.findMany({
      ...params,
      include: {
        supplier: {
          select: { id: true, name: true, companyName: true, phone: true },
        },
        items: {
          select: { id: true, unitName: true, quantity: true, unitCost: true, subTotal: true },
        },
      },
    });
  }

  async count(where?: Prisma.PurchaseWhereInput): Promise<number> {
    return await prisma.purchase.count({ where });
  }

  async countPurchasesToday(startOfDay: Date, endOfDay: Date, tx?: Prisma.TransactionClient): Promise<number> {
    return await this.getDb(tx).purchase.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }
}

export const purchasesRepository = new PurchasesRepository();
