import { z } from 'zod';
import { ExpenseCategory } from '@prisma/client';

export const createExpenseSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
  amount: z.number().positive('Expense amount must be greater than 0'),
  description: z.string().min(2, 'Description is required (e.g. কুলি বিল, বিদ্যুৎ বিল)'),
  recordedAt: z.string().datetime().optional(),
  note: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
