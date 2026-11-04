import { z } from 'zod';

const PaymentMethodEnum = z.enum(['CASH', 'BKASH', 'NAGAD', 'CARD']);

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters'),
    phone: z.string().min(6, 'Please provide a valid phone number'),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
    address: z.string().optional(),
  }),
});

export const recordPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
  body: z.object({
    amount: z.number().positive('Payment amount must be greater than 0'),
    paymentMethod: PaymentMethodEnum.default('CASH'),
    note: z.string().optional(),
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>['body'];
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>['body'];
