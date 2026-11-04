import { z } from 'zod';

const PaymentMethodEnum = z.enum(['CASH', 'CARD', 'BKASH', 'NAGAD']);

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Contact person name must be at least 2 characters'),
    companyName: z.string().optional(),
    phone: z.string().min(6, 'Please provide a valid phone number'),
    address: z.string().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid supplier ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    companyName: z.string().optional(),
    phone: z.string().min(6).optional(),
    address: z.string().optional(),
  }),
});

export const recordSupplierPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid supplier ID format'),
  }),
  body: z.object({
    amount: z.number().positive('Payment amount must be greater than 0'),
    paymentMethod: PaymentMethodEnum.default('CASH'),
    note: z.string().optional(),
  }),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>['body'];
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>['body'];
export type RecordSupplierPaymentInput = z.infer<typeof recordSupplierPaymentSchema>['body'];
