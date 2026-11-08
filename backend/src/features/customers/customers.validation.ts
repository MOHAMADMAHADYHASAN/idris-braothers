import { z } from 'zod';
import { SaleType, CustomerLedgerType } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  customerType: z.nativeEnum(SaleType).default(SaleType.RETAIL),
  openingDue: z.number().default(0), // Can be positive (previous debt) or negative (advance deposit)
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  customerType: z.nativeEnum(SaleType).optional(),
  isActive: z.boolean().optional(),
});

export const receivePaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  note: z.string().optional(),
});

export const adjustBalanceSchema = z.object({
  amount: z.number(), // positive = add to due, negative = reduce due/waiver
  reason: z.string().min(2, 'Adjustment reason is required'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ReceivePaymentInput = z.infer<typeof receivePaymentSchema>;
export type AdjustBalanceInput = z.infer<typeof adjustBalanceSchema>;
