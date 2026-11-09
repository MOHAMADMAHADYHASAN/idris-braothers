import { Prisma, Purchase, PurchaseItem, Supplier } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export type PurchaseItemWithVariant = PurchaseItem & {
  variant: {
    id: string;
    variantName: string;
    sku: string;
    barcode: string | null;
    baseUnitName: string;
    product: {
      id: string;
      name: string;
      banglaName: string | null;
    };
  };
};

export type PurchaseWithDetails = Purchase & {
  items: PurchaseItemWithVariant[];
  supplier: Supplier;
  ledgerEntries?: any[];
};

export class PurchasesRepository extends BaseRepository {
  async create(data: Prisma.PurchaseCreateInput, tx?: Prisma.TransactionClient): Promise<PurchaseWithDetails> {
    return await this.getDb(tx).purchase.create({
      data,
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
                product: {
                  select: { id: true, name: true, banglaName: true },
                },
              },
            },
          },
        },
        supplier: true,
      },
    }) as unknown as PurchaseWithDetails;
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<PurchaseWithDetails | null> {
    return await this.getDb(tx).purchase.findUnique({
      where: { id },
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
                product: {
                  select: { id: true, name: true, banglaName: true },
                },
              },
            },
          },
        },
        supplier: true,
        ledgerEntries: true,
      },
    }) as unknown as PurchaseWithDetails | null;
  }

  async findByPurchaseNumber(purchaseNumber: string): Promise<PurchaseWithDetails | null> {
    return await prisma.purchase.findUnique({
      where: { purchaseNumber },
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
                product: {
                  select: { id: true, name: true, banglaName: true },
                },
              },
            },
          },
        },
        supplier: true,
      },
    }) as unknown as PurchaseWithDetails | null;
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
