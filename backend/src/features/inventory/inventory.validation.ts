import {
  PlainObject,
  ValidationContext,
  parseArray,
  parseBoolean,
  parseNumber,
  parseRecord,
  parseString,
  runValidator,
} from '../../common/utils/validators';

export interface VariantUnitInput {
  unitName: string;
  conversionFactor: number;
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  barcode?: string | null;
  isDefault: boolean;
}

export interface AddVariantInput {
  variantName: string;
  sku?: string | null;
  barcode?: string | null;
  baseUnitName: string;
  allowDecimalQty: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: Record<string, any>;
  stockQuantity: number;
  lowStockAlert: number;
  currentPurchasePrice: number;
  retailPrice: number;
  wholesalePrice: number;
  units: VariantUnitInput[];
}

export interface CreateProductInput {
  name: string;
  banglaName?: string | null;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  hasVariants: boolean;
  sku?: string | null;
  barcode?: string | null;
  baseUnitName: string;
  allowDecimalQty: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: Record<string, any>;
  stockQuantity: number;
  lowStockAlert: number;
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  units: VariantUnitInput[];
  variants?: AddVariantInput[];
}

export interface UpdateProductVariantItemInput {
  id?: string;
  variantName?: string;
  sku?: string | null;
  barcode?: string | null;
  baseUnitName?: string;
  allowDecimalQty?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>;
  stockQuantity?: number;
  lowStockAlert?: number;
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  isActive?: boolean;
  units?: VariantUnitInput[];
}

export interface UpdateProductInput {
  name?: string;
  banglaName?: string | null;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  isActive?: boolean;
  sku?: string | null;
  barcode?: string | null;
  baseUnitName?: string;
  allowDecimalQty?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>;
  stockQuantity?: number;
  lowStockAlert?: number;
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  units?: VariantUnitInput[];
  variants?: UpdateProductVariantItemInput[];
}

export interface UpdateProductPricesInput {
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
}

export interface UpdateVariantInput {
  variantName?: string;
  sku?: string | null;
  barcode?: string | null;
  baseUnitName?: string;
  allowDecimalQty?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>;
  stockQuantity?: number;
  lowStockAlert?: number;
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  isActive?: boolean;
}

export type AddProductUnitInput = VariantUnitInput;

export interface RecordWastageInput {
  variantId: string;
  quantity: number;
  reason: string;
  note?: string | null;
}

export interface CreateCategoryInput {
  name: string;
  banglaName?: string | null;
  parentId?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presetConfig?: Record<string, any> | null;
}

export interface CreateBrandInput {
  name: string;
  banglaName?: string | null;
}

function validateVariantUnit(obj: PlainObject, ctx: ValidationContext, prefix = ''): VariantUnitInput {
  return {
    unitName: parseString(
      obj,
      'unitName',
      ctx,
      { required: true, min: 1, message: 'Unit name is required (e.g. ৫০ কেজি বস্তা, কার্টন, পাল্লা)' },
      prefix
    ) as string,
    conversionFactor: parseNumber(
      obj,
      'conversionFactor',
      ctx,
      { required: true, positive: true, message: 'Conversion factor must be greater than 0' },
      prefix
    ) as number,
    retailPrice: parseNumber(obj, 'retailPrice', ctx, { positive: true, nullable: true }, prefix),
    wholesalePrice: parseNumber(obj, 'wholesalePrice', ctx, { positive: true, nullable: true }, prefix),
    barcode: parseString(obj, 'barcode', ctx, { nullable: true }, prefix),
    isDefault: parseBoolean(obj, 'isDefault', ctx, { defaultVal: false }, prefix) as boolean,
  };
}

function validateVariantInput(obj: PlainObject, ctx: ValidationContext, prefix = ''): AddVariantInput {
  return {
    variantName: parseString(
      obj,
      'variantName',
      ctx,
      { min: 1, defaultVal: 'Default', message: 'Variant name is required (e.g. ৫০০ গ্রাম, ১ কেজি, দেশি)' },
      prefix
    ) as string,
    sku: parseString(obj, 'sku', ctx, { nullable: true }, prefix),
    barcode: parseString(obj, 'barcode', ctx, { nullable: true }, prefix),
    baseUnitName: parseString(
      obj,
      'baseUnitName',
      ctx,
      { min: 1, defaultVal: 'কেজি', message: 'Base unit name is required (e.g. কেজি, প্যাকেট, লিটার, পিস)' },
      prefix
    ) as string,
    allowDecimalQty: parseBoolean(obj, 'allowDecimalQty', ctx, { defaultVal: true }, prefix) as boolean,
    attributes: parseRecord(obj, 'attributes', ctx, { defaultEmpty: true }, prefix) || {},
    stockQuantity: parseNumber(
      obj,
      'stockQuantity',
      ctx,
      { min: 0, defaultVal: 0, message: 'Stock cannot be negative' },
      prefix
    ) as number,
    lowStockAlert: parseNumber(obj, 'lowStockAlert', ctx, { min: 0, defaultVal: 10 }, prefix) as number,
    currentPurchasePrice: parseNumber(
      obj,
      'currentPurchasePrice',
      ctx,
      { required: true, positive: true, message: 'Current purchase price must be greater than 0' },
      prefix
    ) as number,
    retailPrice: parseNumber(
      obj,
      'retailPrice',
      ctx,
      { required: true, positive: true, message: 'Retail price must be greater than 0' },
      prefix
    ) as number,
    wholesalePrice: parseNumber(
      obj,
      'wholesalePrice',
      ctx,
      { required: true, positive: true, message: 'Wholesale price must be greater than 0' },
      prefix
    ) as number,
    units: parseArray(obj, 'units', validateVariantUnit, ctx, { defaultEmpty: true }, prefix) as VariantUnitInput[],
  };
}

/**
 * Extracts optional variant scalar fields shared between single-variant updates and multi-variant item updates.
 */
function pickOptionalVariantFields(
  obj: PlainObject,
  ctx: ValidationContext,
  prefix = ''
): UpdateVariantInput {
  const result: UpdateVariantInput = {};
  const variantName = parseString(obj, 'variantName', ctx, { min: 1 }, prefix);
  if (variantName !== undefined && variantName !== null) result.variantName = variantName;
  const sku = parseString(obj, 'sku', ctx, { nullable: true }, prefix);
  if (sku !== undefined) result.sku = sku;
  const barcode = parseString(obj, 'barcode', ctx, { nullable: true }, prefix);
  if (barcode !== undefined) result.barcode = barcode;
  const baseUnitName = parseString(obj, 'baseUnitName', ctx, { min: 1 }, prefix);
  if (baseUnitName !== undefined && baseUnitName !== null) result.baseUnitName = baseUnitName;
  const allowDecimalQty = parseBoolean(obj, 'allowDecimalQty', ctx, {}, prefix);
  if (allowDecimalQty !== undefined) result.allowDecimalQty = allowDecimalQty;
  const attributes = parseRecord(obj, 'attributes', ctx, {}, prefix);
  if (attributes !== undefined) result.attributes = attributes;
  const stockQuantity = parseNumber(obj, 'stockQuantity', ctx, { min: 0 }, prefix);
  if (stockQuantity !== undefined && stockQuantity !== null) result.stockQuantity = stockQuantity;
  const lowStockAlert = parseNumber(obj, 'lowStockAlert', ctx, { min: 0 }, prefix);
  if (lowStockAlert !== undefined && lowStockAlert !== null) result.lowStockAlert = lowStockAlert;
  const currentPurchasePrice = parseNumber(obj, 'currentPurchasePrice', ctx, { positive: true }, prefix);
  if (currentPurchasePrice !== undefined && currentPurchasePrice !== null) {
    result.currentPurchasePrice = currentPurchasePrice;
  }
  const retailPrice = parseNumber(obj, 'retailPrice', ctx, { positive: true }, prefix);
  if (retailPrice !== undefined && retailPrice !== null) result.retailPrice = retailPrice;
  const wholesalePrice = parseNumber(obj, 'wholesalePrice', ctx, { positive: true }, prefix);
  if (wholesalePrice !== undefined && wholesalePrice !== null) result.wholesalePrice = wholesalePrice;
  const isActive = parseBoolean(obj, 'isActive', ctx, {}, prefix);
  if (isActive !== undefined) result.isActive = isActive;
  return result;
}

function validateUpdateVariantItem(
  obj: PlainObject,
  ctx: ValidationContext,
  prefix: string
): UpdateProductVariantItemInput {
  const result: UpdateProductVariantItemInput = pickOptionalVariantFields(obj, ctx, prefix);
  const id = parseString(obj, 'id', ctx, {}, prefix);
  if (id !== undefined && id !== null) result.id = id;
  const units = parseArray(obj, 'units', validateVariantUnit, ctx, {}, prefix);
  if (units !== undefined) result.units = units;
  return result;
}

function validateCreateProduct(obj: PlainObject, ctx: ValidationContext): CreateProductInput {
  return {
    name: parseString(obj, 'name', ctx, { required: true, min: 2, message: 'Product name is required' }) as string,
    banglaName: parseString(obj, 'banglaName', ctx, { nullable: true }),
    description: parseString(obj, 'description', ctx, { nullable: true }),
    categoryId: parseString(obj, 'categoryId', ctx, { nullable: true }),
    brandId: parseString(obj, 'brandId', ctx, { nullable: true }),
    hasVariants: parseBoolean(obj, 'hasVariants', ctx, { defaultVal: false }) as boolean,
    sku: parseString(obj, 'sku', ctx, { nullable: true }),
    barcode: parseString(obj, 'barcode', ctx, { nullable: true }),
    baseUnitName: parseString(obj, 'baseUnitName', ctx, { min: 1, defaultVal: 'কেজি' }) as string,
    allowDecimalQty: parseBoolean(obj, 'allowDecimalQty', ctx, { defaultVal: true }) as boolean,
    attributes: parseRecord(obj, 'attributes', ctx, { defaultEmpty: true }) || {},
    stockQuantity: parseNumber(obj, 'stockQuantity', ctx, { min: 0, defaultVal: 0 }) as number,
    lowStockAlert: parseNumber(obj, 'lowStockAlert', ctx, { min: 0, defaultVal: 10 }) as number,
    currentPurchasePrice: parseNumber(obj, 'currentPurchasePrice', ctx, { positive: true }) ?? undefined,
    retailPrice: parseNumber(obj, 'retailPrice', ctx, { positive: true }) ?? undefined,
    wholesalePrice: parseNumber(obj, 'wholesalePrice', ctx, { positive: true }) ?? undefined,
    units: parseArray(obj, 'units', validateVariantUnit, ctx, { defaultEmpty: true }) as VariantUnitInput[],
    variants: parseArray(obj, 'variants', validateVariantInput, ctx),
  };
}

function validateUpdateProduct(obj: PlainObject, ctx: ValidationContext): UpdateProductInput {
  const result: UpdateProductInput = pickOptionalVariantFields(obj, ctx);
  const name = parseString(obj, 'name', ctx, { min: 2 });
  if (name !== undefined && name !== null) result.name = name;
  const banglaName = parseString(obj, 'banglaName', ctx, { nullable: true });
  if (banglaName !== undefined) result.banglaName = banglaName;
  const description = parseString(obj, 'description', ctx, { nullable: true });
  if (description !== undefined) result.description = description;
  const categoryId = parseString(obj, 'categoryId', ctx, { nullable: true });
  if (categoryId !== undefined) result.categoryId = categoryId;
  const brandId = parseString(obj, 'brandId', ctx, { nullable: true });
  if (brandId !== undefined) result.brandId = brandId;
  const units = parseArray(obj, 'units', validateVariantUnit, ctx);
  if (units !== undefined) result.units = units;
  const variants = parseArray(obj, 'variants', validateUpdateVariantItem, ctx);
  if (variants !== undefined) result.variants = variants;
  return result;
}

function validateUpdateVariantPrices(obj: PlainObject, ctx: ValidationContext): UpdateProductPricesInput {
  const result: UpdateProductPricesInput = {};
  const currentPurchasePrice = parseNumber(obj, 'currentPurchasePrice', ctx, { positive: true });
  if (currentPurchasePrice !== undefined && currentPurchasePrice !== null) {
    result.currentPurchasePrice = currentPurchasePrice;
  }
  const retailPrice = parseNumber(obj, 'retailPrice', ctx, { positive: true });
  if (retailPrice !== undefined && retailPrice !== null) result.retailPrice = retailPrice;
  const wholesalePrice = parseNumber(obj, 'wholesalePrice', ctx, { positive: true });
  if (wholesalePrice !== undefined && wholesalePrice !== null) result.wholesalePrice = wholesalePrice;
  return result;
}

function validateRecordWastage(obj: PlainObject, ctx: ValidationContext): RecordWastageInput {
  return {
    variantId: parseString(obj, 'variantId', ctx, {
      required: true,
      min: 1,
      message: 'Variant ID is required',
    }) as string,
    quantity: parseNumber(obj, 'quantity', ctx, {
      required: true,
      positive: true,
      message: 'Wastage quantity must be greater than 0',
    }) as number,
    reason: parseString(obj, 'reason', ctx, {
      required: true,
      min: 2,
      message: 'Reason for wastage/shrinkage is required (e.g. শুকিয়ে ওজন হ্রাস)',
    }) as string,
    note: parseString(obj, 'note', ctx, { nullable: true }),
  };
}

function validateCreateCategory(obj: PlainObject, ctx: ValidationContext): CreateCategoryInput {
  return {
    name: parseString(obj, 'name', ctx, { required: true, min: 1, message: 'Category name is required' }) as string,
    banglaName: parseString(obj, 'banglaName', ctx, { nullable: true }),
    parentId: parseString(obj, 'parentId', ctx, { nullable: true }),
    presetConfig: parseRecord(obj, 'presetConfig', ctx) || {},
  };
}

function validateCreateBrand(obj: PlainObject, ctx: ValidationContext): CreateBrandInput {
  return {
    name: parseString(obj, 'name', ctx, { required: true, min: 1, message: 'Brand name is required' }) as string,
    banglaName: parseString(obj, 'banglaName', ctx, { nullable: true }),
  };
}

export const parseCreateProduct = (body: unknown): CreateProductInput =>
  runValidator(validateCreateProduct, body);

export const parseUpdateProduct = (body: unknown): UpdateProductInput =>
  runValidator(validateUpdateProduct, body);

export const parseUpdateVariant = (body: unknown): UpdateVariantInput =>
  runValidator((obj, ctx) => pickOptionalVariantFields(obj, ctx), body);

export const parseUpdateVariantPrices = (body: unknown): UpdateProductPricesInput =>
  runValidator(validateUpdateVariantPrices, body);

export const parseAddProductUnit = (body: unknown): AddProductUnitInput =>
  runValidator((obj, ctx) => validateVariantUnit(obj, ctx), body);

export const parseRecordWastage = (body: unknown): RecordWastageInput =>
  runValidator(validateRecordWastage, body);

export const parseCreateCategory = (body: unknown): CreateCategoryInput =>
  runValidator(validateCreateCategory, body);

export const parseCreateBrand = (body: unknown): CreateBrandInput =>
  runValidator(validateCreateBrand, body);
