import { Prisma, Sale, SaleItem, Customer } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export type SaleItemWithVariant = SaleItem & {
  variant: {
    id: string;
    variantName: string;
    sku: string;
    barcode: string | null;
    baseUnitName: string;
    allowDecimalQty: boolean;
    product: {
      id: string;
      name: string;
      banglaName: string | null;
    };
  };
};

export type SaleWithDetails = Sale & {
  items: SaleItemWithVariant[];
  customer: Customer | null;
  ledgerEntries?: any[];
};

export class SalesRepository extends BaseRepository {
  async create(data: Prisma.SaleCreateInput, tx?: Prisma.TransactionClient): Promise<SaleWithDetails> {
    return await this.getDb(tx).sale.create({
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
    }) as unknown as SaleWithDetails;
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<SaleWithDetails | null> {
    return await this.getDb(tx).sale.findUnique({
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
                allowDecimalQty: true,
                product: {
                  select: { id: true, name: true, banglaName: true },
                },
              },
            },
          },
        },
        customer: true,
        ledgerEntries: true,
      },
    }) as unknown as SaleWithDetails | null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<SaleWithDetails | null> {
    return await prisma.sale.findUnique({
      where: { invoiceNumber },
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
    }) as unknown as SaleWithDetails | null;
  }

  async findMany(params: {
    where?: Prisma.SaleWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.SaleOrderByWithRelationInput;
  }) {
    return await prisma.sale.findMany({
      ...params,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, address: true },
        },
        items: {
          select: {
            id: true,
            unitName: true,
            quantity: true,
            baseQuantity: true,
            unitPrice: true,
            subTotal: true,
            variant: {
              select: {
                id: true,
                variantName: true,
                baseUnitName: true,
                product: {
                  select: { id: true, name: true, banglaName: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateStatus(
    id: string,
    status: Prisma.EnumSaleStatusFilter | any,
    tx?: Prisma.TransactionClient
  ): Promise<SaleWithDetails> {
    return (await this.getDb(tx).sale.update({
      where: { id },
      data: { status },
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
    })) as unknown as SaleWithDetails;
  }

  async count(where?: Prisma.SaleWhereInput): Promise<number> {
    return await prisma.sale.count({ where });
  }

  async countSalesToday(startOfDay: Date, endOfDay: Date, tx?: Prisma.TransactionClient): Promise<number> {
    return await this.getDb(tx).sale.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }
}

export const salesRepository = new SalesRepository();
