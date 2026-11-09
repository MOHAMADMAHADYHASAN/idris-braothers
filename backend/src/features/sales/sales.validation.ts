import { z } from 'zod';
import { SaleType } from '@prisma/client';

export const createSaleItemSchema = z
  .object({
    variantId: z.string().optional(),
    productId: z.string().optional(),
    unitName: z.string().min(1, 'Unit name is required (e.g. কেজি, প্যাকেট, ৫০ কেজি বস্তা)').default('কেজি'),
    conversionFactor: z.number().positive().default(1),
    quantity: z.number().positive('Quantity must be greater than 0').optional(),
    unitPrice: z.number().positive('Unit price must be greater than 0').optional(),
    customTotalPrice: z.number().positive('Custom total price must be greater than 0 (e.g. ২০ টাকার এলাচ)').optional(),
  })
  .refine(
    (data) => data.variantId !== undefined || data.productId !== undefined,
    {
      message: 'Either variantId or productId must be provided',
      path: ['variantId'],
    }
  )
  .refine(
    (data) => data.quantity !== undefined || data.customTotalPrice !== undefined,
    {
      message: 'Either quantity or customTotalPrice must be provided',
      path: ['quantity'],
    }
  );

export const createSaleSchema = z.object({
  saleType: z.nativeEnum(SaleType).default(SaleType.RETAIL),
  customerId: z.string().uuid().optional().nullable(),
  discount: z.number().min(0).default(0),
  paidAmount: z.number().min(0, 'Paid amount cannot be negative'),
  note: z.string().optional().nullable(),
  items: z.array(createSaleItemSchema).min(1, 'Sale must include at least one product item'),
});

export type CreateSaleItemInput = z.infer<typeof createSaleItemSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
