import { ExpenseCategory } from '@prisma/client';
import {
  PlainObject,
  ValidationContext,
  parseEnum,
  parseIsoDatetime,
  parseNumber,
  parseString,
  runValidator,
} from '../../common/utils/validators';

const EXPENSE_CATEGORIES = Object.values(ExpenseCategory) as readonly ExpenseCategory[];

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: number;
  description: string;
  recordedAt?: string;
  note?: string;
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory;
  amount?: number;
  description?: string;
  recordedAt?: string;
  note?: string;
}

function validateCreateExpense(obj: PlainObject, ctx: ValidationContext): CreateExpenseInput {
  return {
    category: parseEnum(obj, 'category', EXPENSE_CATEGORIES, ctx, { required: true }) as ExpenseCategory,
    amount: parseNumber(obj, 'amount', ctx, {
      required: true,
      positive: true,
      message: 'Expense amount must be greater than 0',
    }) as number,
    description: parseString(obj, 'description', ctx, {
      required: true,
      min: 2,
      message: 'Description is required (e.g. কুলি বিল, বিদ্যুৎ বিল)',
    }) as string,
    recordedAt: parseIsoDatetime(obj, 'recordedAt', ctx),
    note: parseString(obj, 'note', ctx) ?? undefined,
  };
}

function validateUpdateExpense(obj: PlainObject, ctx: ValidationContext): UpdateExpenseInput {
  const result: UpdateExpenseInput = {};
  const category = parseEnum(obj, 'category', EXPENSE_CATEGORIES, ctx);
  if (category !== undefined) result.category = category;
  const amount = parseNumber(obj, 'amount', ctx, { positive: true, message: 'Expense amount must be greater than 0' });
  if (amount !== undefined && amount !== null) result.amount = amount;
  const description = parseString(obj, 'description', ctx, { min: 2 });
  if (description !== undefined && description !== null) result.description = description;
  const recordedAt = parseIsoDatetime(obj, 'recordedAt', ctx);
  if (recordedAt !== undefined) result.recordedAt = recordedAt;
  const note = parseString(obj, 'note', ctx);
  if (note !== undefined && note !== null) result.note = note;
  return result;
}

export const parseCreateExpense = (body: unknown): CreateExpenseInput =>
  runValidator(validateCreateExpense, body);

export const parseUpdateExpense = (body: unknown): UpdateExpenseInput =>
  runValidator(validateUpdateExpense, body);
