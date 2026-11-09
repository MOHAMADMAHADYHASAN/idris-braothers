import { z } from 'zod';

export const createPurchaseItemSchema = z
  .object({
    variantId: z.string().optional(),
    productId: z.string().optional(),
    unitName: z.string().min(1, 'Unit name is required (e.g. ৫০ কেজি বস্তা, কার্টন (২৪ প্যাকেট), কেজি)'),
    conversionFactor: z.number().positive('Conversion factor must be greater than 0').default(1),
    quantity: z.number().positive('Quantity must be greater than 0'),
    unitCost: z.number().positive('Unit cost must be greater than 0'),
    newRetailPrice: z.number().positive().optional().nullable(),
    newWholesalePrice: z.number().positive().optional().nullable(),
    saveUnitForFuture: z.boolean().optional().default(false), // Automatically save this custom carton/unit for future use
  })
  .refine(
    (data) => data.variantId !== undefined || data.productId !== undefined,
    {
      message: 'Either variantId or productId must be provided',
      path: ['variantId'],
    }
  );

export const createPurchaseSchema = z.object({
  purchaseNumber: z.string().optional().nullable(), // If omitted, will be auto-generated (PUR-YYMMDD-XXXX)
  supplierId: z.string().uuid('Supplier ID is required'),
  transportCost: z.number().min(0).default(0), // কুলি / ট্রাক ভাড়া
  discount: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  note: z.string().optional().nullable(),
  items: z.array(createPurchaseItemSchema).min(1, 'Purchase must have at least one item'),
});

export type CreatePurchaseItemInput = z.infer<typeof createPurchaseItemSchema>;
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
