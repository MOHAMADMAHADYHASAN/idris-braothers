import { Prisma, Sale, SaleItem } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export class SalesRepository extends BaseRepository {

  async create(data: Prisma.SaleCreateInput, tx?: Prisma.TransactionClient): Promise<Sale & { items: SaleItem[] }> {
    return await this.getDb(tx).sale.create({
      data,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, banglaName: true, baseUnitName: true },
            },
          },
        },
        customer: true,
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    return await this.getDb(tx).sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, banglaName: true, baseUnitName: true },
            },
          },
        },
        customer: true,
        ledgerEntries: true,
      },
    });
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    return await prisma.sale.findUnique({
      where: { invoiceNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, banglaName: true, baseUnitName: true },
            },
          },
        },
        customer: true,
      },
    });
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
          select: { id: true, name: true, phone: true },
        },
        items: {
          select: { id: true, unitName: true, quantity: true, unitPrice: true, subTotal: true },
        },
      },
    });
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
