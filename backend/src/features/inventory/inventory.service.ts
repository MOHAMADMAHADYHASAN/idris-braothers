import { Prisma } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { inventoryRepository } from './inventory.repository';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import {
  CreateProductInput,
  UpdateProductInput,
  UpdateProductPricesInput,
  AddProductUnitInput,
  RecordWastageInput,
} from './inventory.validation';

export class InventoryService {
  /**
   * Create a new product in the store catalog with optional custom selling/buying units
   */
  async createProduct(data: CreateProductInput) {
    if (data.barcode) {
      const existingBarcode = await inventoryRepository.findByBarcode(data.barcode);
      if (existingBarcode) {
        throw new AppError(`Product with barcode "${data.barcode}" already exists`, 409);
      }
    }

    if (data.sku) {
      const existingSku = await inventoryRepository.findBySku(data.sku);
      if (existingSku) {
        throw new AppError(`Product with SKU "${data.sku}" already exists`, 409);
      }
    }

    return await inventoryRepository.create({
      name: data.name,
      banglaName: data.banglaName,
      category: data.category,
      sku: data.sku,
      barcode: data.barcode,
      baseUnitName: data.baseUnitName,
      stockQuantity: new Prisma.Decimal(data.stockQuantity),
      lowStockAlert: new Prisma.Decimal(data.lowStockAlert),
      currentPurchasePrice: new Prisma.Decimal(data.currentPurchasePrice),
      retailPrice: new Prisma.Decimal(data.retailPrice),
      wholesalePrice: new Prisma.Decimal(data.wholesalePrice),
      ...(data.units && data.units.length > 0 && {
        units: {
          create: data.units.map((u) => ({
            unitName: u.unitName,
            conversionFactor: new Prisma.Decimal(u.conversionFactor),
            retailPrice: u.retailPrice ? new Prisma.Decimal(u.retailPrice) : null,
            wholesalePrice: u.wholesalePrice ? new Prisma.Decimal(u.wholesalePrice) : null,
            isDefault: u.isDefault ?? false,
          })),
        },
      }),
    });
  }

  /**
   * List products with search, pagination, category, and low-stock filter
   */
  async getProducts(query: {
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { banglaName: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      inventoryRepository.count(where),
      inventoryRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    let result = products;
    if (query.lowStockOnly) {
      result = products.filter((p) => p.stockQuantity.lessThanOrEqualTo(p.lowStockAlert));
    }

    return {
      products: result,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Fast Barcode lookup (Cashier Barcode Scanner)
   */
  async getProductByBarcode(barcode: string) {
    const product = await inventoryRepository.findByBarcode(barcode);

    if (!product || !product.isActive) {
      throw new AppError(`No active product found with barcode: ${barcode}`, 404);
    }

    return product;
  }

  /**
   * Get product details by ID
   */
  async getProductById(id: string) {
    const product = await inventoryRepository.findById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Update general product details
   */
  async updateProduct(id: string, data: UpdateProductInput) {
    await this.getProductById(id);

    return await inventoryRepository.update(id, {
      ...(data.name && { name: data.name }),
      ...(data.banglaName !== undefined && { banglaName: data.banglaName }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.sku !== undefined && { sku: data.sku }),
      ...(data.barcode !== undefined && { barcode: data.barcode }),
      ...(data.baseUnitName && { baseUnitName: data.baseUnitName }),
      ...(data.lowStockAlert !== undefined && {
        lowStockAlert: new Prisma.Decimal(data.lowStockAlert),
      }),
      ...(data.currentPurchasePrice !== undefined && {
        currentPurchasePrice: new Prisma.Decimal(data.currentPurchasePrice),
      }),
      ...(data.retailPrice !== undefined && {
        retailPrice: new Prisma.Decimal(data.retailPrice),
      }),
      ...(data.wholesalePrice !== undefined && {
        wholesalePrice: new Prisma.Decimal(data.wholesalePrice),
      }),
      ...(data.stockQuantity !== undefined && {
        stockQuantity: new Prisma.Decimal(data.stockQuantity),
      }),
    });
  }

  /**
   * Dynamic Replacement Cost & Selling Rates Update (বাজারদর পরিবর্তন)
   */
  async updateProductPrices(id: string, data: UpdateProductPricesInput) {
    await this.getProductById(id);

    const prices: {
      currentPurchasePrice?: Prisma.Decimal;
      retailPrice?: Prisma.Decimal;
      wholesalePrice?: Prisma.Decimal;
    } = {};

    if (data.currentPurchasePrice !== undefined) {
      prices.currentPurchasePrice = new Prisma.Decimal(data.currentPurchasePrice);
    }
    if (data.retailPrice !== undefined) {
      prices.retailPrice = new Prisma.Decimal(data.retailPrice);
    }
    if (data.wholesalePrice !== undefined) {
      prices.wholesalePrice = new Prisma.Decimal(data.wholesalePrice);
    }

    return await inventoryRepository.updatePrices(id, prices);
  }

  /**
   * Add a custom selling/buying unit (e.g., ৫০ কেজি বস্তা, ৫ কেজি পাল্লা)
   */
  async addProductUnit(productId: string, data: AddProductUnitInput) {
    await this.getProductById(productId);

    return await inventoryRepository.addUnit({
      product: { connect: { id: productId } },
      unitName: data.unitName,
      conversionFactor: new Prisma.Decimal(data.conversionFactor),
      retailPrice: data.retailPrice ? new Prisma.Decimal(data.retailPrice) : null,
      wholesalePrice: data.wholesalePrice ? new Prisma.Decimal(data.wholesalePrice) : null,
      isDefault: data.isDefault ?? false,
    });
  }

  /**
   * Delete custom product unit
   */
  async deleteProductUnit(unitId: string) {
    return await inventoryRepository.deleteUnit(unitId);
  }

  /**
   * Record Stock Wastage / Shrinkage (শুকিয়ে যাওয়া, অপচয়, ঘাটতি)
   */
  async recordWastage(productId: string, data: RecordWastageInput) {
    const product = await this.getProductById(productId);
    const wastageQty = new Prisma.Decimal(data.quantity);

    if (product.stockQuantity.lessThan(wastageQty)) {
      throw new AppError(
        `Cannot record wastage of ${wastageQty} ${product.baseUnitName}. Current available stock is only ${product.stockQuantity} ${product.baseUnitName}`,
        400
      );
    }

    const lossAmount = wastageQty.mul(product.currentPurchasePrice);

    return await prisma.$transaction(async (tx) => {
      // 1. Deduct stock from product
      await inventoryRepository.adjustStock(productId, wastageQty, 'SUBTRACT', tx);

      // 2. Create StockWastage record with snapshot of purchase cost
      return await inventoryRepository.recordWastage(
        {
          product: { connect: { id: productId } },
          quantity: wastageQty,
          costPriceSnapshot: product.currentPurchasePrice,
          lossAmount,
          reason: data.reason,
          note: data.note,
        },
        tx
      );
    });
  }

  /**
   * Get list of recorded wastages
   */
  async getWastageHistory(query: { productId?: string } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.StockWastageWhereInput = {};
    if (query.productId) {
      where.productId = query.productId;
    }

    const [total, wastages] = await Promise.all([
      inventoryRepository.countWastages(where),
      inventoryRepository.findWastages({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' },
      }),
    ]);

    return {
      wastages,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}

export const inventoryService = new InventoryService();
