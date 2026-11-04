import { z } from 'zod';

const PaymentMethodEnum = z.enum([
  'CASH',
  'CARD',
  'BKASH',
  'NAGAD',
  'DUE',
  'SPLIT',
]);

const PurchaseStatusEnum = z.enum(['COMPLETED', 'PARTIAL', 'DUE', 'CANCELLED']);

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid('Invalid supplier ID format'),
    purchaseNumber: z.string().optional(), // Can use supplier's paper chalan #
    items: z
      .array(
        z.object({
          productId: z.string().uuid('Invalid product ID format'),
          quantity: z.number().positive('Quantity must be greater than 0'),
          unitCost: z.number().positive('Unit cost must be greater than 0'),
        })
      )
      .min(1, 'At least 1 item is required in a purchase chalan'),
    discount: z.number().min(0, 'Discount cannot be negative').default(0),
    paidAmount: z.number().min(0, 'Paid amount cannot be negative'),
    paymentMethod: PaymentMethodEnum.default('CASH'),
  }),
});

export const getPurchasesQuerySchema = z.object({
  query: z.object({
    supplierId: z.string().uuid().optional(),
    status: PurchaseStatusEnum.optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>['body'];
export type GetPurchasesQueryInput = z.infer<typeof getPurchasesQuerySchema>['query'];
