import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Supplier / Mahajan contact name is required'),
  companyName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  openingPayable: z.number().default(0), // Can be positive (store owes mahajan) or negative (advance with mahajan)
});

export const updateSupplierSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const paySupplierSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  note: z.string().optional(),
});

export const adjustSupplierBalanceSchema = z.object({
  amount: z.number(), // positive = increases store debt, negative = decreases store debt (discount/rebate)
  reason: z.string().min(2, 'Adjustment reason is required'),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type PaySupplierInput = z.infer<typeof paySupplierSchema>;
export type AdjustSupplierBalanceInput = z.infer<typeof adjustSupplierBalanceSchema>;
