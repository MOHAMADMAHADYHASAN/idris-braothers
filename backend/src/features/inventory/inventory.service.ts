import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import {
  CreateProductInput,
  UpdateProductInput,
  AdjustStockInput,
} from './inventory.validation';

export class InventoryService {
  /**
   * Create a new product in the store catalog
   */
  async createProduct(data: CreateProductInput) {
    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: data.barcode },
      });
      if (existingBarcode) {
        throw new AppError(`Product with barcode "${data.barcode}" already exists`, 409);
      }
    }

    if (data.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        throw new AppError(`Product with SKU "${data.sku}" already exists`, 409);
      }
    }

    return await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        stock: new Prisma.Decimal(data.stock),
        lowStockLimit: new Prisma.Decimal(data.lowStockLimit),
        unit: data.unit,
        costPrice: new Prisma.Decimal(data.costPrice),
        sellingPrice: new Prisma.Decimal(data.sellingPrice),
      },
    });
  }

  /**
   * List products with search, pagination, and low-stock filter
   */
  async getProducts(query: {
    search?: string;
    lowStockOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let result = products;
    if (query.lowStockOnly) {
      result = products.filter((p) => p.stock.lessThanOrEqualTo(p.lowStockLimit));
    }

    return {
      products: result,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fast Barcode lookup (Cashier Barcode Scanner)
   */
  async getProductByBarcode(barcode: string) {
    const product = await prisma.product.findUnique({
      where: { barcode },
    });

    if (!product || !product.isActive) {
      throw new AppError(`No active product found with barcode: ${barcode}`, 404);
    }

    return product;
  }

  /**
   * Get product details by ID
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Update product details
   */
  async updateProduct(id: string, data: UpdateProductInput) {
    await this.getProductById(id);

    return await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.lowStockLimit !== undefined && {
          lowStockLimit: new Prisma.Decimal(data.lowStockLimit),
        }),
        ...(data.unit && { unit: data.unit }),
        ...(data.costPrice !== undefined && {
          costPrice: new Prisma.Decimal(data.costPrice),
        }),
        ...(data.sellingPrice !== undefined && {
          sellingPrice: new Prisma.Decimal(data.sellingPrice),
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  /**
   * Stock In / Adjustment (restocking or damage adjustment)
   */
  async adjustStock(id: string, data: AdjustStockInput) {
    const product = await this.getProductById(id);
    const amount = new Prisma.Decimal(data.amount);

    if (data.type === 'SUBTRACT' && product.stock.lessThan(amount)) {
      throw new AppError(
        `Cannot subtract ${amount} items. Current stock is only ${product.stock}`,
        400
      );
    }

    return await prisma.product.update({
      where: { id },
      data: {
        stock:
          data.type === 'ADD'
            ? { increment: amount }
            : { decrement: amount },
      },
    });
  }

  /**
   * Soft Delete: Deactivates product while preserving past invoices
   */
  async deleteProduct(id: string) {
    await this.getProductById(id);

    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const inventoryService = new InventoryService();
