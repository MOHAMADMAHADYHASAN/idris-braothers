import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  banglaName: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  baseUnitName: z.string().min(1, 'Base unit name is required (e.g. কেজি, প্যাকেট, লিটার, পিস)').default('কেজি'),
  currentPurchasePrice: z.number().positive('Current purchase price must be greater than 0'),
  retailPrice: z.number().positive('Retail price must be greater than 0'),
  wholesalePrice: z.number().positive('Wholesale price must be greater than 0'),
  stockQuantity: z.number().min(0, 'Initial stock cannot be negative').default(0),
  lowStockAlert: z.number().min(0).default(10),
  units: z
    .array(
      z.object({
        unitName: z.string().min(1, 'Unit name is required (e.g. ৫০ কেজি বস্তা, কার্টন)'),
        conversionFactor: z.number().positive('Conversion factor must be greater than 0'),
        retailPrice: z.number().positive().optional(),
        wholesalePrice: z.number().positive().optional(),
        isDefault: z.boolean().optional().default(false),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const updateProductPricesSchema = z.object({
  currentPurchasePrice: z.number().positive().optional(),
  retailPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
});

export const addProductUnitSchema = z.object({
  unitName: z.string().min(1, 'Unit name is required (e.g. ৫০ কেজি বস্তা, ৫ কেজি পাল্লা, কার্টন)'),
  conversionFactor: z.number().positive('Conversion factor must be greater than 0'),
  retailPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const recordWastageSchema = z.object({
  quantity: z.number().positive('Wastage quantity must be greater than 0'),
  reason: z.string().min(2, 'Reason for wastage/shrinkage is required (e.g. শুকিয়ে ওজন হ্রাস)'),
  note: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProductPricesInput = z.infer<typeof updateProductPricesSchema>;
export type AddProductUnitInput = z.infer<typeof addProductUnitSchema>;
export type RecordWastageInput = z.infer<typeof recordWastageSchema>;
