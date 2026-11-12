import {
  PlainObject,
  ValidationContext,
  parseBoolean,
  parseNumber,
  parseString,
  runValidator,
} from '../../common/utils/validators';

export interface CreateSupplierInput {
  name: string;
  companyName?: string | null;
  phone?: string | null;
  address?: string | null;
  openingPayable: number;
}

export interface UpdateSupplierInput {
  name?: string;
  companyName?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
}

export interface PaySupplierInput {
  amount: number;
  note?: string;
}

export interface AdjustSupplierBalanceInput {
  amount: number;
  reason: string;
}

function validateCreateSupplier(obj: PlainObject, ctx: ValidationContext): CreateSupplierInput {
  return {
    name: parseString(obj, 'name', ctx, {
      required: true,
      min: 2,
      message: 'Supplier / Mahajan contact name is required',
    }) as string,
    companyName: parseString(obj, 'companyName', ctx, { nullable: true }),
    phone: parseString(obj, 'phone', ctx, { nullable: true }),
    address: parseString(obj, 'address', ctx, { nullable: true }),
    openingPayable: parseNumber(obj, 'openingPayable', ctx, { defaultVal: 0 }) as number,
  };
}

function validateUpdateSupplier(obj: PlainObject, ctx: ValidationContext): UpdateSupplierInput {
  const result: UpdateSupplierInput = {};
  const name = parseString(obj, 'name', ctx, { min: 2 });
  if (name !== undefined && name !== null) result.name = name;
  const companyName = parseString(obj, 'companyName', ctx, { nullable: true });
  if (companyName !== undefined) result.companyName = companyName;
  const phone = parseString(obj, 'phone', ctx, { nullable: true });
  if (phone !== undefined) result.phone = phone;
  const address = parseString(obj, 'address', ctx, { nullable: true });
  if (address !== undefined) result.address = address;
  const isActive = parseBoolean(obj, 'isActive', ctx);
  if (isActive !== undefined) result.isActive = isActive;
  return result;
}

function validatePaySupplier(obj: PlainObject, ctx: ValidationContext): PaySupplierInput {
  return {
    amount: parseNumber(obj, 'amount', ctx, {
      required: true,
      positive: true,
      message: 'Payment amount must be greater than 0',
    }) as number,
    note: parseString(obj, 'note', ctx) ?? undefined,
  };
}

function validateAdjustSupplierBalance(obj: PlainObject, ctx: ValidationContext): AdjustSupplierBalanceInput {
  return {
    amount: parseNumber(obj, 'amount', ctx, { required: true }) as number,
    reason: parseString(obj, 'reason', ctx, {
      required: true,
      min: 2,
      message: 'Adjustment reason is required',
    }) as string,
  };
}

export const parseCreateSupplier = (body: unknown): CreateSupplierInput =>
  runValidator(validateCreateSupplier, body);

export const parseUpdateSupplier = (body: unknown): UpdateSupplierInput =>
  runValidator(validateUpdateSupplier, body);

export const parsePaySupplier = (body: unknown): PaySupplierInput =>
  runValidator(validatePaySupplier, body);

export const parseAdjustSupplierBalance = (body: unknown): AdjustSupplierBalanceInput =>
  runValidator(validateAdjustSupplierBalance, body);
