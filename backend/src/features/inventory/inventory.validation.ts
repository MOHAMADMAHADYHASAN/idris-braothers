import { z } from 'zod';

const variantUnitInputSchema = z.object({
  unitName: z.string().min(1, 'Unit name is required (e.g. ৫০ কেজি বস্তা, কার্টন, পাল্লা)'),
  conversionFactor: z.number().positive('Conversion factor must be greater than 0'),
  retailPrice: z.number().positive().optional().nullable(),
  wholesalePrice: z.number().positive().optional().nullable(),
  barcode: z.string().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

const variantInputSchema = z.object({
  variantName: z.string().min(1, 'Variant name is required (e.g. ৫০০ গ্রাম, ১ কেজি, দেশি)').default('Default'),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  baseUnitName: z.string().min(1, 'Base unit name is required (e.g. কেজি, প্যাকেট, লিটার, পিস)').default('কেজি'),
  allowDecimalQty: z.boolean().optional().default(true),
  attributes: z.record(z.any()).optional().default({}),
  stockQuantity: z.number().min(0, 'Stock cannot be negative').default(0),
  lowStockAlert: z.number().min(0).default(10),
  currentPurchasePrice: z.number().positive('Current purchase price must be greater than 0'),
  retailPrice: z.number().positive('Retail price must be greater than 0'),
  wholesalePrice: z.number().positive('Wholesale price must be greater than 0'),
  units: z.array(variantUnitInputSchema).optional().default([]),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  banglaName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  hasVariants: z.boolean().optional().default(false),

  // For Simple Products (hasVariants: false)
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  baseUnitName: z.string().min(1).optional().default('কেজি'),
  allowDecimalQty: z.boolean().optional().default(true),
  attributes: z.record(z.any()).optional().default({}),
  stockQuantity: z.number().min(0).optional().default(0),
  lowStockAlert: z.number().min(0).optional().default(10),
  currentPurchasePrice: z.number().positive().optional(),
  retailPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  units: z.array(variantUnitInputSchema).optional().default([]),

  // For Variable Products (hasVariants: true)
  variants: z.array(variantInputSchema).optional(),
});

export const updateProductVariantItemSchema = z.object({
  id: z.string().optional(),
  variantName: z.string().min(1).optional(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  baseUnitName: z.string().min(1).optional(),
  allowDecimalQty: z.boolean().optional(),
  attributes: z.record(z.any()).optional(),
  stockQuantity: z.number().min(0).optional(),
  lowStockAlert: z.number().min(0).optional(),
  currentPurchasePrice: z.number().positive().optional(),
  retailPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  units: z.array(variantUnitInputSchema).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  banglaName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),

  // For Simple Products (hasVariants: false)
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  baseUnitName: z.string().min(1).optional(),
  allowDecimalQty: z.boolean().optional(),
  attributes: z.record(z.any()).optional(),
  stockQuantity: z.number().min(0).optional(),
  lowStockAlert: z.number().min(0).optional(),
  currentPurchasePrice: z.number().positive().optional(),
  retailPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  units: z.array(variantUnitInputSchema).optional(),

  // For Variable Products (hasVariants: true)
  variants: z.array(updateProductVariantItemSchema).optional(),
});

export const updateVariantPricesSchema = z.object({
  currentPurchasePrice: z.number().positive().optional(),
  retailPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
});

export const updateVariantSchema = z.object({
  variantName: z.string().min(1).optional(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  baseUnitName: z.string().min(1).optional(),
  allowDecimalQty: z.boolean().optional(),
  attributes: z.record(z.any()).optional(),
  stockQuantity: z.number().min(0).optional(),
  lowStockAlert: z.number().min(0).optional(),
  currentPurchasePrice: z.number().positive().optional(),
  retailPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export const addVariantSchema = variantInputSchema;

export const addProductUnitSchema = variantUnitInputSchema;

export const recordWastageSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().positive('Wastage quantity must be greater than 0'),
  reason: z.string().min(2, 'Reason for wastage/shrinkage is required (e.g. শুকিয়ে ওজন হ্রাস)'),
  note: z.string().optional().nullable(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  banglaName: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  banglaName: z.string().optional().nullable(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type UpdateProductPricesInput = z.infer<typeof updateVariantPricesSchema>;
export type AddProductUnitInput = z.infer<typeof addProductUnitSchema>;
export type AddVariantInput = z.infer<typeof addVariantSchema>;
export type RecordWastageInput = z.infer<typeof recordWastageSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
