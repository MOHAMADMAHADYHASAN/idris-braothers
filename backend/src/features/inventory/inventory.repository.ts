import { Prisma, Product, ProductUnit, StockWastage } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export class InventoryRepository extends BaseRepository {

  async create(data: Prisma.ProductCreateInput, tx?: Prisma.TransactionClient): Promise<Product> {
    return await this.getDb(tx).product.create({
      data,
      include: { units: true },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<(Product & { units: ProductUnit[] }) | null> {
    return await this.getDb(tx).product.findUnique({
      where: { id },
      include: { units: true },
    });
  }

  async findByBarcode(barcode: string, tx?: Prisma.TransactionClient): Promise<(Product & { units: ProductUnit[] }) | null> {
    return await this.getDb(tx).product.findUnique({
      where: { barcode },
      include: { units: true },
    });
  }

  async findBySku(sku: string, tx?: Prisma.TransactionClient): Promise<Product | null> {
    return await this.getDb(tx).product.findUnique({
      where: { sku },
    });
  }

  async findMany(params: {
    where?: Prisma.ProductWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<(Product & { units: ProductUnit[] })[]> {
    return await prisma.product.findMany({
      ...params,
      include: { units: true },
    });
  }

  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return await prisma.product.count({ where });
  }

  async update(id: string, data: Prisma.ProductUpdateInput, tx?: Prisma.TransactionClient): Promise<Product> {
    return await this.getDb(tx).product.update({
      where: { id },
      data,
      include: { units: true },
    });
  }

  async adjustStock(
    id: string,
    baseQuantity: Prisma.Decimal,
    operation: 'ADD' | 'SUBTRACT',
    tx?: Prisma.TransactionClient
  ): Promise<Product> {
    return await this.getDb(tx).product.update({
      where: { id },
      data: {
        stockQuantity: operation === 'ADD' ? { increment: baseQuantity } : { decrement: baseQuantity },
      },
    });
  }

  async updatePrices(
    id: string,
    prices: {
      currentPurchasePrice?: Prisma.Decimal;
      retailPrice?: Prisma.Decimal;
      wholesalePrice?: Prisma.Decimal;
    },
    tx?: Prisma.TransactionClient
  ): Promise<Product> {
    return await this.getDb(tx).product.update({
      where: { id },
      data: prices,
    });
  }

  async addUnit(
    data: Prisma.ProductUnitCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<ProductUnit> {
    return await this.getDb(tx).productUnit.create({ data });
  }

  async upsertUnit(
    productId: string,
    unitName: string,
    conversionFactor: Prisma.Decimal,
    retailPrice?: Prisma.Decimal | null,
    wholesalePrice?: Prisma.Decimal | null,
    tx?: Prisma.TransactionClient
  ): Promise<ProductUnit> {
    return await this.getDb(tx).productUnit.upsert({
      where: {
        productId_unitName: {
          productId,
          unitName,
        },
      },
      create: {
        product: { connect: { id: productId } },
        unitName,
        conversionFactor,
        retailPrice: retailPrice ?? null,
        wholesalePrice: wholesalePrice ?? null,
      },
      update: {
        conversionFactor,
        ...(retailPrice !== undefined && { retailPrice }),
        ...(wholesalePrice !== undefined && { wholesalePrice }),
      },
    });
  }

  async deleteUnit(unitId: string, tx?: Prisma.TransactionClient): Promise<ProductUnit> {
    return await this.getDb(tx).productUnit.delete({
      where: { id: unitId },
    });
  }

  async recordWastage(
    data: Prisma.StockWastageCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<StockWastage> {
    return await this.getDb(tx).stockWastage.create({ data });
  }

  async findWastages(params: {
    where?: Prisma.StockWastageWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.StockWastageOrderByWithRelationInput;
  }) {
    return await prisma.stockWastage.findMany({
      ...params,
      include: {
        product: {
          select: { id: true, name: true, baseUnitName: true },
        },
      },
    });
  }

  async countWastages(where?: Prisma.StockWastageWhereInput): Promise<number> {
    return await prisma.stockWastage.count({ where });
  }
}

export const inventoryRepository = new InventoryRepository();
