import { Prisma } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { inventoryRepository } from './inventory.repository';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import {
  CreateProductInput,
  UpdateProductInput,
  UpdateVariantInput,
  UpdateProductPricesInput,
  AddProductUnitInput,
  RecordWastageInput,
} from './inventory.validation';

function generateSku(text: string, suffix?: string): string {
  const clean = text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return suffix ? `${clean || 'ITEM'}-${suffix.toUpperCase()}-${rand}` : `${clean || 'ITEM'}-${rand}`;
}

export class InventoryService {
  /**
   * Create a new product in the store catalog.
   * Handles both:
   * 1. Simple Product (একক সাধারণ পণ্য - e.g. চিনি, খোলা এলাচ): Auto-creates 1 parent Product + 1 default Variant ('Default')
   * 2. Variable Product (বহুমুখী পণ্য - e.g. ডানো দুধ ৫০০ গ্রাম, ১ কেজি): Creates parent Product + multiple Variants with bulk units
   */
  async createProduct(data: CreateProductInput) {
    if (!data.hasVariants) {
      // 1. Simple Product Mode
      if (data.barcode) {
        const existingBarcode = await inventoryRepository.findVariantByBarcode(data.barcode);
        if (existingBarcode) {
          throw new AppError(`Product/Variant with barcode "${data.barcode}" already exists`, 409);
        }
      }

      const sku = data.sku?.trim() || generateSku(data.name, 'DEF');
      const existingSku = await inventoryRepository.findVariantBySku(sku);
      if (existingSku) {
        throw new AppError(`Product with SKU "${sku}" already exists`, 409);
      }

      const purchasePrice = data.currentPurchasePrice !== undefined ? new Prisma.Decimal(data.currentPurchasePrice) : new Prisma.Decimal(0);
      const retailPrice = data.retailPrice !== undefined ? new Prisma.Decimal(data.retailPrice) : new Prisma.Decimal(0);
      const wholesalePrice = data.wholesalePrice !== undefined ? new Prisma.Decimal(data.wholesalePrice) : new Prisma.Decimal(0);

      if (purchasePrice.lessThanOrEqualTo(0) || retailPrice.lessThanOrEqualTo(0) || wholesalePrice.lessThanOrEqualTo(0)) {
        throw new AppError('Prices (purchase, retail, wholesale) must be greater than 0 for simple products', 400);
      }

      return await inventoryRepository.create({
        name: data.name,
        banglaName: data.banglaName || null,
        description: data.description || null,
        hasVariants: false,
        ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
        ...(data.brandId && { brand: { connect: { id: data.brandId } } }),
        variants: {
          create: [
            {
              variantName: 'Default',
              sku,
              barcode: data.barcode || null,
              baseUnitName: data.baseUnitName || 'কেজি',
              allowDecimalQty: data.allowDecimalQty !== undefined ? data.allowDecimalQty : true,
              attributes: data.attributes || {},
              stockQuantity: new Prisma.Decimal(data.stockQuantity || 0),
              lowStockAlert: new Prisma.Decimal(data.lowStockAlert || 10),
              currentPurchasePrice: purchasePrice,
              retailPrice,
              wholesalePrice,
              ...(data.units && data.units.length > 0 && {
                units: {
                  create: data.units.map((u) => ({
                    unitName: u.unitName,
                    conversionFactor: new Prisma.Decimal(u.conversionFactor),
                    retailPrice: u.retailPrice ? new Prisma.Decimal(u.retailPrice) : null,
                    wholesalePrice: u.wholesalePrice ? new Prisma.Decimal(u.wholesalePrice) : null,
                    barcode: u.barcode || null,
                    isDefault: u.isDefault ?? false,
                  })),
                },
              }),
            },
          ],
        },
      });
    }

    // 2. Variable Product Mode
    if (!data.variants || data.variants.length === 0) {
      throw new AppError('At least one variant is required when "hasVariants" is enabled', 400);
    }

    // Validate unique barcodes and skus
    for (const v of data.variants) {
      if (v.barcode) {
        const existingBarcode = await inventoryRepository.findVariantByBarcode(v.barcode);
        if (existingBarcode) {
          throw new AppError(`Variant with barcode "${v.barcode}" already exists`, 409);
        }
      }
      if (v.sku) {
        const existingSku = await inventoryRepository.findVariantBySku(v.sku);
        if (existingSku) {
          throw new AppError(`Variant with SKU "${v.sku}" already exists`, 409);
        }
      }
    }

    return await inventoryRepository.create({
      name: data.name,
      banglaName: data.banglaName || null,
      description: data.description || null,
      hasVariants: true,
      ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
      ...(data.brandId && { brand: { connect: { id: data.brandId } } }),
      variants: {
        create: data.variants.map((v, idx) => ({
          variantName: v.variantName,
          sku: v.sku?.trim() || generateSku(data.name, `V${idx + 1}`),
          barcode: v.barcode || null,
          baseUnitName: v.baseUnitName || 'কেজি',
          allowDecimalQty: v.allowDecimalQty !== undefined ? v.allowDecimalQty : true,
          attributes: v.attributes || {},
          stockQuantity: new Prisma.Decimal(v.stockQuantity || 0),
          lowStockAlert: new Prisma.Decimal(v.lowStockAlert || 10),
          currentPurchasePrice: new Prisma.Decimal(v.currentPurchasePrice),
          retailPrice: new Prisma.Decimal(v.retailPrice),
          wholesalePrice: new Prisma.Decimal(v.wholesalePrice),
          ...(v.units && v.units.length > 0 && {
            units: {
              create: v.units.map((u) => ({
                unitName: u.unitName,
                conversionFactor: new Prisma.Decimal(u.conversionFactor),
                retailPrice: u.retailPrice ? new Prisma.Decimal(u.retailPrice) : null,
                wholesalePrice: u.wholesalePrice ? new Prisma.Decimal(u.wholesalePrice) : null,
                barcode: u.barcode || null,
                isDefault: u.isDefault ?? false,
              })),
            },
          }),
        })),
      },
    });
  }

  /**
   * List products with search, pagination, category, and low-stock filter
   */
  async getProducts(query: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    lowStockOnly?: boolean;
  } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.brandId) {
      where.brandId = query.brandId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { banglaName: { contains: query.search, mode: 'insensitive' } },
        {
          variants: {
            some: {
              OR: [
                { variantName: { contains: query.search, mode: 'insensitive' } },
                { barcode: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          },
        },
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
      result = products.filter((p) =>
        p.variants.some((v) => v.stockQuantity.lessThanOrEqualTo(v.lowStockAlert))
      );
    }

    return {
      products: result,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Fast Barcode lookup (Cashier Barcode Scanner)
   * Resolves both variant barcodes and bulk carton/sack unit barcodes
   */
  async getProductByBarcode(barcode: string) {
    const result = await inventoryRepository.findVariantByBarcode(barcode);

    if (!result || !result.variant.isActive || !result.variant.product.isActive) {
      throw new AppError(`No active product found with barcode: ${barcode}`, 404);
    }

    return result;
  }

  /**
   * Get product details by ID (including all variants and units)
   */
  async getProductById(id: string) {
    const product = await inventoryRepository.findById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Get variant details by variantId
   */
  async getVariantById(variantId: string) {
    const variant = await inventoryRepository.findVariantById(variantId);

    if (!variant) {
      throw new AppError('Product variant not found', 404);
    }

    return variant;
  }

  /**
   * Update general product details, default variant or variable variants in an atomic transaction
   */
  async updateProduct(id: string, data: UpdateProductInput) {
    const existing = await this.getProductById(id);

    return await prisma.$transaction(async (tx) => {
      // 1. Update parent product attributes
      await tx.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.banglaName !== undefined && { banglaName: data.banglaName }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.categoryId !== undefined && {
            category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
          }),
          ...(data.brandId !== undefined && {
            brand: data.brandId ? { connect: { id: data.brandId } } : { disconnect: true },
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      // 2. Simple Product Mode (!hasVariants)
      if (!existing.hasVariants) {
        const primaryVariant = existing.variants[0];

        // Check SKU collision if changed
        if (data.sku && (!primaryVariant || primaryVariant.sku !== data.sku)) {
          const skuConflict = await inventoryRepository.findVariantBySku(data.sku, tx);
          if (skuConflict && skuConflict.id !== primaryVariant?.id) {
            throw new AppError(`Variant with SKU "${data.sku}" already exists`, 409);
          }
        }

        // Check Barcode collision if changed
        if (data.barcode && (!primaryVariant || primaryVariant.barcode !== data.barcode)) {
          const barcodeConflict = await inventoryRepository.findVariantByBarcode(data.barcode, tx);
          if (barcodeConflict && barcodeConflict.variant.id !== primaryVariant?.id) {
            throw new AppError(`Variant with barcode "${data.barcode}" already exists`, 409);
          }
        }

        let targetVariantId: string;

        if (primaryVariant) {
          targetVariantId = primaryVariant.id;
          await tx.productVariant.update({
            where: { id: primaryVariant.id },
            data: {
              ...(data.sku !== undefined && { sku: data.sku || primaryVariant.sku }),
              ...(data.barcode !== undefined && { barcode: data.barcode || null }),
              ...(data.baseUnitName && { baseUnitName: data.baseUnitName }),
              ...(data.allowDecimalQty !== undefined && { allowDecimalQty: data.allowDecimalQty }),
              ...(data.attributes !== undefined && { attributes: data.attributes }),
              ...(data.stockQuantity !== undefined && { stockQuantity: new Prisma.Decimal(data.stockQuantity) }),
              ...(data.lowStockAlert !== undefined && { lowStockAlert: new Prisma.Decimal(data.lowStockAlert) }),
              ...(data.currentPurchasePrice !== undefined && { currentPurchasePrice: new Prisma.Decimal(data.currentPurchasePrice) }),
              ...(data.retailPrice !== undefined && { retailPrice: new Prisma.Decimal(data.retailPrice) }),
              ...(data.wholesalePrice !== undefined && { wholesalePrice: new Prisma.Decimal(data.wholesalePrice) }),
              ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
          });
        } else {
          // If primary variant was somehow missing, create it
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: id,
              variantName: 'Default',
              sku: data.sku || generateSku(data.name || existing.name),
              barcode: data.barcode || null,
              baseUnitName: data.baseUnitName || 'কেজি',
              allowDecimalQty: data.allowDecimalQty !== undefined ? data.allowDecimalQty : true,
              attributes: data.attributes || {},
              stockQuantity: new Prisma.Decimal(data.stockQuantity || 0),
              lowStockAlert: new Prisma.Decimal(data.lowStockAlert || 10),
              currentPurchasePrice: new Prisma.Decimal(data.currentPurchasePrice || 0),
              retailPrice: new Prisma.Decimal(data.retailPrice || 0),
              wholesalePrice: new Prisma.Decimal(data.wholesalePrice || 0),
            },
          });
          targetVariantId = createdVariant.id;
        }

        // Sync units if provided
        if (data.units !== undefined) {
          await tx.variantUnit.deleteMany({
            where: { variantId: targetVariantId },
          });

          if (data.units.length > 0) {
            await tx.variantUnit.createMany({
              data: data.units.map((u) => ({
                variantId: targetVariantId,
                unitName: u.unitName,
                conversionFactor: new Prisma.Decimal(u.conversionFactor),
                retailPrice: u.retailPrice ? new Prisma.Decimal(u.retailPrice) : null,
                wholesalePrice: u.wholesalePrice ? new Prisma.Decimal(u.wholesalePrice) : null,
                barcode: u.barcode || null,
                isDefault: u.isDefault ?? false,
              })),
            });
          }
        }
      }

      // 3. Variable Product Mode (hasVariants)
      if (existing.hasVariants && data.variants && data.variants.length > 0) {
        // Collect submitted existing variant IDs
        const submittedIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id!));

        // Soft-deactivate or delete removed variants
        const removedVariants = existing.variants.filter((v) => !submittedIds.has(v.id));
        for (const rem of removedVariants) {
          const [saleCount, purchaseCount, wastageCount] = await Promise.all([
            tx.saleItem.count({ where: { variantId: rem.id } }),
            tx.purchaseItem.count({ where: { variantId: rem.id } }),
            tx.stockWastage.count({ where: { variantId: rem.id } }),
          ]);

          if (saleCount > 0 || purchaseCount > 0 || wastageCount > 0) {
            await tx.productVariant.update({
              where: { id: rem.id },
              data: { isActive: false },
            });
          } else {
            await tx.productVariant.delete({
              where: { id: rem.id },
            });
          }
        }

        // Upsert / update submitted variants
        for (let idx = 0; idx < data.variants.length; idx++) {
          const v = data.variants[idx];

          if (v.id) {
            // Check SKU / Barcode conflicts
            if (v.sku) {
              const skuConflict = await inventoryRepository.findVariantBySku(v.sku, tx);
              if (skuConflict && skuConflict.id !== v.id) {
                throw new AppError(`Variant with SKU "${v.sku}" already exists`, 409);
              }
            }
            if (v.barcode) {
              const barcodeConflict = await inventoryRepository.findVariantByBarcode(v.barcode, tx);
              if (barcodeConflict && barcodeConflict.variant.id !== v.id) {
                throw new AppError(`Variant with barcode "${v.barcode}" already exists`, 409);
              }
            }

            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                ...(v.variantName && { variantName: v.variantName }),
                ...(v.sku !== undefined && { sku: v.sku || undefined }),
                ...(v.barcode !== undefined && { barcode: v.barcode || null }),
                ...(v.baseUnitName && { baseUnitName: v.baseUnitName }),
                ...(v.allowDecimalQty !== undefined && { allowDecimalQty: v.allowDecimalQty }),
                ...(v.attributes !== undefined && { attributes: v.attributes }),
                ...(v.stockQuantity !== undefined && { stockQuantity: new Prisma.Decimal(v.stockQuantity) }),
                ...(v.lowStockAlert !== undefined && { lowStockAlert: new Prisma.Decimal(v.lowStockAlert) }),
                ...(v.currentPurchasePrice !== undefined && { currentPurchasePrice: new Prisma.Decimal(v.currentPurchasePrice) }),
                ...(v.retailPrice !== undefined && { retailPrice: new Prisma.Decimal(v.retailPrice) }),
                ...(v.wholesalePrice !== undefined && { wholesalePrice: new Prisma.Decimal(v.wholesalePrice) }),
                ...(v.isActive !== undefined && { isActive: v.isActive }),
              },
            });

            if (v.units !== undefined) {
              await tx.variantUnit.deleteMany({
                where: { variantId: v.id },
              });
              if (v.units.length > 0) {
                await tx.variantUnit.createMany({
                  data: v.units.map((u) => ({
                    variantId: v.id!,
                    unitName: u.unitName,
                    conversionFactor: new Prisma.Decimal(u.conversionFactor),
                    retailPrice: u.retailPrice ? new Prisma.Decimal(u.retailPrice) : null,
                    wholesalePrice: u.wholesalePrice ? new Prisma.Decimal(u.wholesalePrice) : null,
                    barcode: u.barcode || null,
                    isDefault: u.isDefault ?? false,
                  })),
                });
              }
            }
          } else {
            // New variant added in modal
            const sku = v.sku?.trim() || generateSku(data.name || existing.name, `V${idx + 1}`);
            if (v.barcode) {
              const barcodeConflict = await inventoryRepository.findVariantByBarcode(v.barcode, tx);
              if (barcodeConflict) {
                throw new AppError(`Variant with barcode "${v.barcode}" already exists`, 409);
              }
            }
            const skuConflict = await inventoryRepository.findVariantBySku(sku, tx);
            if (skuConflict) {
              throw new AppError(`Variant with SKU "${sku}" already exists`, 409);
            }

            await tx.productVariant.create({
              data: {
                productId: id,
                variantName: v.variantName || `ভ্যারিয়েন্ট ${idx + 1}`,
                sku,
                barcode: v.barcode || null,
                baseUnitName: v.baseUnitName || 'কেজি',
                allowDecimalQty: v.allowDecimalQty !== undefined ? v.allowDecimalQty : true,
                attributes: v.attributes || {},
                stockQuantity: new Prisma.Decimal(v.stockQuantity || 0),
                lowStockAlert: new Prisma.Decimal(v.lowStockAlert || 10),
                currentPurchasePrice: new Prisma.Decimal(v.currentPurchasePrice || 0),
                retailPrice: new Prisma.Decimal(v.retailPrice || 0),
                wholesalePrice: new Prisma.Decimal(v.wholesalePrice || 0),
                ...(v.units && v.units.length > 0 && {
                  units: {
                    create: v.units.map((u) => ({
                      unitName: u.unitName,
                      conversionFactor: new Prisma.Decimal(u.conversionFactor),
                      retailPrice: u.retailPrice ? new Prisma.Decimal(u.retailPrice) : null,
                      wholesalePrice: u.wholesalePrice ? new Prisma.Decimal(u.wholesalePrice) : null,
                      barcode: u.barcode || null,
                      isDefault: u.isDefault ?? false,
                    })),
                  },
                }),
              },
            });
          }
        }
      }

      // 4. Return the fully re-hydrated product with category, brand, and all variants + units
      return (await inventoryRepository.findById(id, tx))!;
    });
  }

  /**
   * Update specific variant details
   */
  async updateVariant(variantId: string, data: UpdateVariantInput) {
    await this.getVariantById(variantId);

    return await inventoryRepository.updateVariant(variantId, {
      ...(data.variantName && { variantName: data.variantName }),
      ...(data.sku !== undefined && { sku: data.sku || undefined }),
      ...(data.barcode !== undefined && { barcode: data.barcode || null }),
      ...(data.baseUnitName && { baseUnitName: data.baseUnitName }),
      ...(data.allowDecimalQty !== undefined && { allowDecimalQty: data.allowDecimalQty }),
      ...(data.attributes !== undefined && { attributes: data.attributes }),
      ...(data.stockQuantity !== undefined && { stockQuantity: new Prisma.Decimal(data.stockQuantity) }),
      ...(data.lowStockAlert !== undefined && { lowStockAlert: new Prisma.Decimal(data.lowStockAlert) }),
      ...(data.currentPurchasePrice !== undefined && { currentPurchasePrice: new Prisma.Decimal(data.currentPurchasePrice) }),
      ...(data.retailPrice !== undefined && { retailPrice: new Prisma.Decimal(data.retailPrice) }),
      ...(data.wholesalePrice !== undefined && { wholesalePrice: new Prisma.Decimal(data.wholesalePrice) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    });
  }

  /**
   * Delete or Soft-Deactivate a Variant with Historical Protection Guard (Variant Reconciliation)
   * If the variant has past transactions (sales, purchases, wastages), soft-deactivates (isActive = false)
   * to protect relational integrity and prevent ledger crashes. If no history exists, safely hard-deletes.
   */
  async deleteVariant(variantId: string) {
    const variant = await inventoryRepository.findVariantById(variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    const [saleCount, purchaseCount, wastageCount] = await Promise.all([
      prisma.saleItem.count({ where: { variantId } }),
      prisma.purchaseItem.count({ where: { variantId } }),
      prisma.stockWastage.count({ where: { variantId } }),
    ]);

    const hasHistory = saleCount > 0 || purchaseCount > 0 || wastageCount > 0;

    if (hasHistory) {
      // Soft-deactivate to preserve past invoice integrity
      return await inventoryRepository.updateVariant(variantId, { isActive: false });
    }

    // Safe hard delete
    return await prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  /**
   * Dynamic Replacement Cost & Selling Rates Update (বাজারদর পরিবর্তন)
   * If given an ID, handles both variantId directly, or a parent productId (updating its default variant)
   */
  async updateProductPrices(id: string, data: UpdateProductPricesInput) {
    let targetVariantId = id;

    // Check if `id` is a variant ID
    const variant = await inventoryRepository.findVariantById(id);
    if (!variant) {
      // Check if `id` is a parent product ID
      const product = await inventoryRepository.findById(id);
      if (!product || product.variants.length === 0) {
        throw new AppError('Product or variant not found', 404);
      }
      targetVariantId = product.variants[0].id;
    }

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

    return await inventoryRepository.updatePrices(targetVariantId, prices);
  }

  /**
   * Add a custom selling/buying unit (e.g. ৫০ কেজি বস্তা, কার্টন) to a variant
   */
  async addProductUnit(targetId: string, data: AddProductUnitInput) {
    let targetVariantId = targetId;

    const variant = await inventoryRepository.findVariantById(targetId);
    if (!variant) {
      const product = await inventoryRepository.findById(targetId);
      if (!product || product.variants.length === 0) {
        throw new AppError('Product or variant not found', 404);
      }
      targetVariantId = product.variants[0].id;
    }

    return await inventoryRepository.addUnit({
      variant: { connect: { id: targetVariantId } },
      unitName: data.unitName,
      conversionFactor: new Prisma.Decimal(data.conversionFactor),
      retailPrice: data.retailPrice ? new Prisma.Decimal(data.retailPrice) : null,
      wholesalePrice: data.wholesalePrice ? new Prisma.Decimal(data.wholesalePrice) : null,
      barcode: data.barcode || null,
      isDefault: data.isDefault ?? false,
    });
  }

  /**
   * Delete custom variant unit
   */
  async deleteProductUnit(unitId: string) {
    return await inventoryRepository.deleteUnit(unitId);
  }

  /**
   * Record Stock Wastage / Shrinkage (শুকিয়ে ওজন হ্রাস, নষ্ট, ঘাটতি)
   */
  async recordWastage(targetId: string, data: { quantity: number; reason: string; note?: string | null }) {
    let targetVariantId = targetId;

    let variant = await inventoryRepository.findVariantById(targetId);
    if (!variant) {
      const product = await inventoryRepository.findById(targetId);
      if (!product || product.variants.length === 0) {
        throw new AppError('Product or variant not found', 404);
      }
      targetVariantId = product.variants[0].id;
      variant = await inventoryRepository.findVariantById(targetVariantId);
    }

    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    const wastageQty = new Prisma.Decimal(data.quantity);

    if (variant.stockQuantity.lessThan(wastageQty)) {
      throw new AppError(
        `Cannot record wastage of ${wastageQty} ${variant.baseUnitName}. Current available stock is only ${variant.stockQuantity} ${variant.baseUnitName}`,
        400
      );
    }

    const lossAmount = wastageQty.mul(variant.currentPurchasePrice);

    return await prisma.$transaction(async (tx) => {
      // 1. Deduct stock from variant
      await inventoryRepository.adjustStock(targetVariantId, wastageQty, 'SUBTRACT', tx);

      // 2. Create StockWastage record with snapshot of replacement purchase cost
      return await inventoryRepository.recordWastage(
        {
          variant: { connect: { id: targetVariantId } },
          quantity: wastageQty,
          costPriceSnapshot: variant!.currentPurchasePrice,
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
  async getWastageHistory(query: { variantId?: string; productId?: string } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.StockWastageWhereInput = {};
    if (query.variantId) {
      where.variantId = query.variantId;
    } else if (query.productId) {
      where.variant = { productId: query.productId };
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
