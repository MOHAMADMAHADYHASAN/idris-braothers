import { SaleType } from '@prisma/client';
import {
  PlainObject,
  ValidationContext,
  parseBoolean,
  parseEnum,
  parseNumber,
  parseString,
  runValidator,
} from '../../common/utils/validators';

const SALE_TYPES = Object.values(SaleType) as readonly SaleType[];

export interface CreateCustomerInput {
  name: string;
  phone?: string | null;
  address?: string | null;
  customerType: SaleType;
  openingDue: number;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string | null;
  address?: string | null;
  customerType?: SaleType;
  isActive?: boolean;
}

export interface ReceivePaymentInput {
  amount: number;
  note?: string;
}

export interface AdjustBalanceInput {
  amount: number;
  reason: string;
}

function validateCreateCustomer(obj: PlainObject, ctx: ValidationContext): CreateCustomerInput {
  return {
    name: parseString(obj, 'name', ctx, { required: true, min: 2, message: 'Customer name is required' }) as string,
    phone: parseString(obj, 'phone', ctx, { nullable: true }),
    address: parseString(obj, 'address', ctx, { nullable: true }),
    customerType: parseEnum(obj, 'customerType', SALE_TYPES, ctx, { defaultVal: SaleType.RETAIL }) as SaleType,
    openingDue: parseNumber(obj, 'openingDue', ctx, { defaultVal: 0 }) as number,
  };
}

function validateUpdateCustomer(obj: PlainObject, ctx: ValidationContext): UpdateCustomerInput {
  const result: UpdateCustomerInput = {};
  const name = parseString(obj, 'name', ctx, { min: 2 });
  if (name !== undefined && name !== null) result.name = name;
  const phone = parseString(obj, 'phone', ctx, { nullable: true });
  if (phone !== undefined) result.phone = phone;
  const address = parseString(obj, 'address', ctx, { nullable: true });
  if (address !== undefined) result.address = address;
  const customerType = parseEnum(obj, 'customerType', SALE_TYPES, ctx);
  if (customerType !== undefined) result.customerType = customerType;
  const isActive = parseBoolean(obj, 'isActive', ctx);
  if (isActive !== undefined) result.isActive = isActive;
  return result;
}

function validateReceivePayment(obj: PlainObject, ctx: ValidationContext): ReceivePaymentInput {
  return {
    amount: parseNumber(obj, 'amount', ctx, {
      required: true,
      positive: true,
      message: 'Payment amount must be greater than 0',
    }) as number,
    note: parseString(obj, 'note', ctx) ?? undefined,
  };
}

function validateAdjustBalance(obj: PlainObject, ctx: ValidationContext): AdjustBalanceInput {
  return {
    amount: parseNumber(obj, 'amount', ctx, { required: true }) as number,
    reason: parseString(obj, 'reason', ctx, {
      required: true,
      min: 2,
      message: 'Adjustment reason is required',
    }) as string,
  };
}

export const parseCreateCustomer = (body: unknown): CreateCustomerInput =>
  runValidator(validateCreateCustomer, body);

export const parseUpdateCustomer = (body: unknown): UpdateCustomerInput =>
  runValidator(validateUpdateCustomer, body);

export const parseReceivePayment = (body: unknown): ReceivePaymentInput =>
  runValidator(validateReceivePayment, body);

export const parseAdjustBalance = (body: unknown): AdjustBalanceInput =>
  runValidator(validateAdjustBalance, body);
