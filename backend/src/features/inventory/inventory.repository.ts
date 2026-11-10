import { Prisma, Product, ProductVariant, VariantUnit, StockWastage } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export type ProductWithDetails = Product & {
  category?: { id: string; name: string; banglaName: string | null } | null;
  brand?: { id: string; name: string; banglaName: string | null } | null;
  variants: (ProductVariant & { units: VariantUnit[] })[];
};

export type VariantWithDetails = ProductVariant & {
  product: Product;
  units: VariantUnit[];
};

export class InventoryRepository extends BaseRepository {
  /**
   * Create a parent product with nested variants and their units in a single transaction
   */
  async create(data: Prisma.ProductCreateInput, tx?: Prisma.TransactionClient): Promise<ProductWithDetails> {
    return await this.getDb(tx).product.create({
      data,
      include: {
        category: { select: { id: true, name: true, banglaName: true } },
        brand: { select: { id: true, name: true, banglaName: true } },
        variants: {
          include: { units: true },
        },
      },
    }) as ProductWithDetails;
  }

  /**
   * Find product by ID with category, brand, and all variants + units
   */
  async findById(id: string, tx?: Prisma.TransactionClient): Promise<ProductWithDetails | null> {
    return await this.getDb(tx).product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, banglaName: true } },
        brand: { select: { id: true, name: true, banglaName: true } },
        variants: {
          include: { units: true },
        },
      },
    }) as ProductWithDetails | null;
  }

  /**
   * Find a specific sellable variant by its ID
   */
  async findVariantById(variantId: string, tx?: Prisma.TransactionClient): Promise<VariantWithDetails | null> {
    return await this.getDb(tx).productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        units: true,
      },
    });
  }

  /**
   * Find a variant by barcode, checking both ProductVariant.barcode and VariantUnit.barcode
   */
  async findVariantByBarcode(barcode: string, tx?: Prisma.TransactionClient): Promise<{
    variant: VariantWithDetails;
    matchedUnit?: VariantUnit;
  } | null> {
    // 1. Direct match on ProductVariant barcode
    const variant = await this.getDb(tx).productVariant.findUnique({
      where: { barcode },
      include: {
        product: true,
        units: true,
      },
    });

    if (variant) {
      return { variant };
    }

    // 2. Match on VariantUnit barcode (e.g. barcode printed on a 24-piece carton or 50kg sack)
    const unit = await this.getDb(tx).variantUnit.findUnique({
      where: { barcode },
      include: {
        variant: {
          include: {
            product: true,
            units: true,
          },
        },
      },
    });

    if (unit) {
      return {
        variant: unit.variant,
        matchedUnit: unit,
      };
    }

    return null;
  }

  /**
   * Hardware scanner & POS lookup: matches variant.barcode -> unit.barcode -> variant.sku
   * Keeps strict barcode uniqueness checks separate from hardware scan resolution.
   */
  async findByScanCode(code: string, tx?: Prisma.TransactionClient): Promise<{
    variant: VariantWithDetails;
    matchedUnit?: VariantUnit;
  } | null> {
    const barcodeMatch = await this.findVariantByBarcode(code, tx);
    if (barcodeMatch) {
      return barcodeMatch;
    }

    const skuMatch = await this.getDb(tx).productVariant.findFirst({
      where: {
        sku: { equals: code.trim(), mode: 'insensitive' },
        isActive: true,
        product: { isActive: true },
      },
      include: {
        product: true,
        units: true,
      },
    });

    if (skuMatch) {
      return { variant: skuMatch };
    }

    return null;
  }

  /**
   * Find variant by SKU
   */
  async findVariantBySku(sku: string, tx?: Prisma.TransactionClient): Promise<VariantWithDetails | null> {
    return await this.getDb(tx).productVariant.findUnique({
      where: { sku },
      include: {
        product: true,
        units: true,
      },
    });
  }

  /**
   * Find products with filtering, search, and pagination
   */
  async findMany(params: {
    where?: Prisma.ProductWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<ProductWithDetails[]> {
    return await prisma.product.findMany({
      ...params,
      include: {
        category: { select: { id: true, name: true, banglaName: true } },
        brand: { select: { id: true, name: true, banglaName: true } },
        variants: {
          include: { units: true },
        },
      },
    }) as ProductWithDetails[];
  }

  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return await prisma.product.count({ where });
  }

  /**
   * Update parent product attributes
   */
  async update(id: string, data: Prisma.ProductUpdateInput, tx?: Prisma.TransactionClient): Promise<ProductWithDetails> {
    return await this.getDb(tx).product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, banglaName: true } },
        brand: { select: { id: true, name: true, banglaName: true } },
        variants: {
          include: { units: true },
        },
      },
    }) as ProductWithDetails;
  }

  /**
   * Update variant attributes
   */
  async updateVariant(
    variantId: string,
    data: Prisma.ProductVariantUpdateInput,
    tx?: Prisma.TransactionClient
  ): Promise<VariantWithDetails> {
    return await this.getDb(tx).productVariant.update({
      where: { id: variantId },
      data,
      include: {
        product: true,
        units: true,
      },
    });
  }

  /**
   * Adjust stock on a specific variant (ADD or SUBTRACT)
   */
  async adjustStock(
    variantId: string,
    baseQuantity: Prisma.Decimal,
    operation: 'ADD' | 'SUBTRACT',
    tx?: Prisma.TransactionClient
  ): Promise<ProductVariant> {
    return await this.getDb(tx).productVariant.update({
      where: { id: variantId },
      data: {
        stockQuantity: operation === 'ADD' ? { increment: baseQuantity } : { decrement: baseQuantity },
      },
    });
  }

  /**
   * Update replacement purchase price and retail/wholesale prices on a variant
   */
  async updatePrices(
    variantId: string,
    prices: {
      currentPurchasePrice?: Prisma.Decimal;
      retailPrice?: Prisma.Decimal;
      wholesalePrice?: Prisma.Decimal;
    },
    tx?: Prisma.TransactionClient
  ): Promise<ProductVariant> {
    return await this.getDb(tx).productVariant.update({
      where: { id: variantId },
      data: prices,
    });
  }

  /**
   * Add a custom bulk unit (carton, sack, palla) to a variant
   */
  async addUnit(
    data: Prisma.VariantUnitCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<VariantUnit> {
    return await this.getDb(tx).variantUnit.create({ data });
  }

  /**
   * Upsert a custom bulk unit on a variant
   */
  async upsertUnit(
    variantId: string,
    unitName: string,
    conversionFactor: Prisma.Decimal,
    retailPrice?: Prisma.Decimal | null,
    wholesalePrice?: Prisma.Decimal | null,
    barcode?: string | null,
    tx?: Prisma.TransactionClient
  ): Promise<VariantUnit> {
    return await this.getDb(tx).variantUnit.upsert({
      where: {
        variantId_unitName: {
          variantId,
          unitName,
        },
      },
      create: {
        variant: { connect: { id: variantId } },
        unitName,
        conversionFactor,
        retailPrice: retailPrice ?? null,
        wholesalePrice: wholesalePrice ?? null,
        barcode: barcode ?? null,
      },
      update: {
        conversionFactor,
        ...(retailPrice !== undefined && { retailPrice }),
        ...(wholesalePrice !== undefined && { wholesalePrice }),
        ...(barcode !== undefined && { barcode }),
      },
    });
  }

  /**
   * Delete a variant unit
   */
  async deleteUnit(unitId: string, tx?: Prisma.TransactionClient): Promise<VariantUnit> {
    return await this.getDb(tx).variantUnit.delete({
      where: { id: unitId },
    });
  }

  /**
   * Record Stock Wastage / Shrinkage linked to a specific variant
   */
  async recordWastage(
    data: Prisma.StockWastageCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<StockWastage> {
    return await this.getDb(tx).stockWastage.create({ data });
  }

  /**
   * Find wastages with variant and parent product details
   */
  async findWastages(params: {
    where?: Prisma.StockWastageWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.StockWastageOrderByWithRelationInput;
  }) {
    return await prisma.stockWastage.findMany({
      ...params,
      include: {
        variant: {
          select: {
            id: true,
            variantName: true,
            baseUnitName: true,
            sku: true,
            product: {
              select: { id: true, name: true, banglaName: true },
            },
          },
        },
      },
    });
  }

  async countWastages(where?: Prisma.StockWastageWhereInput): Promise<number> {
    return await prisma.stockWastage.count({ where });
  }
}

export const inventoryRepository = new InventoryRepository();
