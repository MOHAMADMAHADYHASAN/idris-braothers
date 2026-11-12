import {
  PlainObject,
  ValidationContext,
  parseArray,
  parseBoolean,
  parseNumber,
  parseString,
  parseUuid,
  runValidator,
} from '../../common/utils/validators';

export interface CreatePurchaseItemInput {
  variantId?: string;
  productId?: string;
  unitName: string;
  conversionFactor: number;
  quantity: number;
  unitCost: number;
  newRetailPrice?: number | null;
  newWholesalePrice?: number | null;
  saveUnitForFuture: boolean;
}

export interface CreatePurchaseInput {
  purchaseNumber?: string | null;
  supplierId: string;
  transportCost: number;
  discount: number;
  paidAmount: number;
  note?: string | null;
  items: CreatePurchaseItemInput[];
}

function validatePurchaseItem(obj: PlainObject, ctx: ValidationContext, prefix: string): CreatePurchaseItemInput {
  const variantId = parseString(obj, 'variantId', ctx, {}, prefix) ?? undefined;
  const productId = parseString(obj, 'productId', ctx, {}, prefix) ?? undefined;
  const unitName = parseString(
    obj,
    'unitName',
    ctx,
    { required: true, min: 1, message: 'Unit name is required (e.g. ৫০ কেজি বস্তা, কার্টন (২৪ প্যাকেট), কেজি)' },
    prefix
  ) as string;
  const conversionFactor = parseNumber(
    obj,
    'conversionFactor',
    ctx,
    { positive: true, defaultVal: 1, message: 'Conversion factor must be greater than 0' },
    prefix
  ) as number;
  const quantity = parseNumber(
    obj,
    'quantity',
    ctx,
    { required: true, positive: true, message: 'Quantity must be greater than 0' },
    prefix
  ) as number;
  const unitCost = parseNumber(
    obj,
    'unitCost',
    ctx,
    { required: true, positive: true, message: 'Unit cost must be greater than 0' },
    prefix
  ) as number;
  const newRetailPrice = parseNumber(obj, 'newRetailPrice', ctx, { positive: true, nullable: true }, prefix);
  const newWholesalePrice = parseNumber(obj, 'newWholesalePrice', ctx, { positive: true, nullable: true }, prefix);
  const saveUnitForFuture = parseBoolean(obj, 'saveUnitForFuture', ctx, { defaultVal: false }, prefix) as boolean;

  if (variantId === undefined && productId === undefined) {
    ctx.addIssue(`${prefix}.variantId`, 'Either variantId or productId must be provided');
  }

  return {
    variantId,
    productId,
    unitName,
    conversionFactor,
    quantity,
    unitCost,
    newRetailPrice,
    newWholesalePrice,
    saveUnitForFuture,
  };
}

function validateCreatePurchase(obj: PlainObject, ctx: ValidationContext): CreatePurchaseInput {
  return {
    purchaseNumber: parseString(obj, 'purchaseNumber', ctx, { nullable: true }),
    supplierId: parseUuid(obj, 'supplierId', ctx, { required: true, message: 'Supplier ID is required' }) as string,
    transportCost: parseNumber(obj, 'transportCost', ctx, { min: 0, defaultVal: 0 }) as number,
    discount: parseNumber(obj, 'discount', ctx, { min: 0, defaultVal: 0 }) as number,
    paidAmount: parseNumber(obj, 'paidAmount', ctx, { min: 0, defaultVal: 0 }) as number,
    note: parseString(obj, 'note', ctx, { nullable: true }),
    items: parseArray(obj, 'items', validatePurchaseItem, ctx, {
      required: true,
      minLen: 1,
      message: 'Purchase must have at least one item',
    }) as CreatePurchaseItemInput[],
  };
}

export const parseCreatePurchase = (body: unknown): CreatePurchaseInput =>
  runValidator(validateCreatePurchase, body);
