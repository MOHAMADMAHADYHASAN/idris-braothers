import { z } from 'zod';

const PaymentMethodEnum = z.enum([
  'CASH',
  'CARD',
  'BKASH',
  'NAGAD',
  'DUE',
  'SPLIT',
]);

const SaleStatusEnum = z.enum(['COMPLETED', 'PARTIAL', 'DUE', 'CANCELLED']);

export const createSaleSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID format').optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid('Invalid product ID format'),
          quantity: z.number().positive('Quantity must be greater than 0'),
        })
      )
      .min(1, 'Cart cannot be empty. At least 1 item is required'),
    discount: z.number().min(0, 'Discount cannot be negative').default(0),
    paidAmount: z.number().min(0, 'Paid amount cannot be negative'),
    paymentMethod: PaymentMethodEnum.default('CASH'),
  }),
});

export const getSalesQuerySchema = z.object({
  query: z.object({
    customerId: z.string().uuid().optional(),
    status: SaleStatusEnum.optional(),
    paymentMethod: PaymentMethodEnum.optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getSaleParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Sale identifier is required'),
  }),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>['body'];
export type GetSalesQueryInput = z.infer<typeof getSalesQuerySchema>['query'];
