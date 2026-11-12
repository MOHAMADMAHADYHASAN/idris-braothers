import { SaleType } from '@prisma/client';
import {
  PlainObject,
  ValidationContext,
  parseArray,
  parseEnum,
  parseNumber,
  parseString,
  parseUuid,
  runValidator,
} from '../../common/utils/validators';

const SALE_TYPES = Object.values(SaleType) as readonly SaleType[];

export interface CreateSaleItemInput {
  variantId?: string;
  productId?: string;
  unitName: string;
  conversionFactor: number;
  quantity?: number;
  unitPrice?: number;
  customTotalPrice?: number;
}

export interface CreateSaleInput {
  saleType: SaleType;
  customerId?: string | null;
  discount: number;
  paidAmount: number;
  note?: string | null;
  items: CreateSaleItemInput[];
}

function validateSaleItem(obj: PlainObject, ctx: ValidationContext, prefix: string): CreateSaleItemInput {
  const variantId = parseString(obj, 'variantId', ctx, {}, prefix) ?? undefined;
  const productId = parseString(obj, 'productId', ctx, {}, prefix) ?? undefined;
  const unitName = parseString(
    obj,
    'unitName',
    ctx,
    { min: 1, defaultVal: 'কেজি', message: 'Unit name is required (e.g. কেজি, প্যাকেট, ৫০ কেজি বস্তা)' },
    prefix
  ) as string;
  const conversionFactor = parseNumber(obj, 'conversionFactor', ctx, { positive: true, defaultVal: 1 }, prefix) as number;
  const quantity =
    parseNumber(obj, 'quantity', ctx, { positive: true, message: 'Quantity must be greater than 0' }, prefix) ??
    undefined;
  const unitPrice =
    parseNumber(obj, 'unitPrice', ctx, { positive: true, message: 'Unit price must be greater than 0' }, prefix) ??
    undefined;
  const customTotalPrice =
    parseNumber(
      obj,
      'customTotalPrice',
      ctx,
      { positive: true, message: 'Custom total price must be greater than 0 (e.g. ২০ টাকার এলাচ)' },
      prefix
    ) ?? undefined;

  if (variantId === undefined && productId === undefined) {
    ctx.addIssue(`${prefix}.variantId`, 'Either variantId or productId must be provided');
  }
  if (quantity === undefined && customTotalPrice === undefined) {
    ctx.addIssue(`${prefix}.quantity`, 'Either quantity or customTotalPrice must be provided');
  }

  return {
    variantId,
    productId,
    unitName,
    conversionFactor,
    quantity,
    unitPrice,
    customTotalPrice,
  };
}

function validateCreateSale(obj: PlainObject, ctx: ValidationContext): CreateSaleInput {
  return {
    saleType: parseEnum(obj, 'saleType', SALE_TYPES, ctx, { defaultVal: SaleType.RETAIL }) as SaleType,
    customerId: parseUuid(obj, 'customerId', ctx, { nullable: true }),
    discount: parseNumber(obj, 'discount', ctx, { min: 0, defaultVal: 0 }) as number,
    paidAmount: parseNumber(obj, 'paidAmount', ctx, {
      required: true,
      min: 0,
      message: 'Paid amount cannot be negative',
    }) as number,
    note: parseString(obj, 'note', ctx, { nullable: true }),
    items: parseArray(obj, 'items', validateSaleItem, ctx, {
      required: true,
      minLen: 1,
      message: 'Sale must include at least one product item',
    }) as CreateSaleItemInput[],
  };
}

export const parseCreateSale = (body: unknown): CreateSaleInput =>
  runValidator(validateCreateSale, body);
