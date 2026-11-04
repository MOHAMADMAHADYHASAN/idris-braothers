import { z } from 'zod';

const UnitTypeEnum = z.enum(['PCS', 'KG', 'GRAM', 'LITER', 'PACKET']);

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    stock: z.number().min(0, 'Initial stock cannot be negative').default(0),
    lowStockLimit: z.number().min(0, 'Low stock limit cannot be negative').default(5),
    unit: UnitTypeEnum.default('PCS'),
    costPrice: z.number().positive('Cost price must be greater than 0'),
    sellingPrice: z.number().positive('Selling price must be greater than 0'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    lowStockLimit: z.number().min(0).optional(),
    unit: UnitTypeEnum.optional(),
    costPrice: z.number().positive().optional(),
    sellingPrice: z.number().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const adjustStockSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
  body: z.object({
    amount: z.number().positive('Adjustment amount must be positive'),
    type: z.enum(['ADD', 'SUBTRACT']),
    reason: z.string().optional(),
  }),
});

export const barcodeQuerySchema = z.object({
  params: z.object({
    barcode: z.string().min(1, 'Barcode is required'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type AdjustStockInput = z.infer<typeof adjustStockSchema>['body'];
