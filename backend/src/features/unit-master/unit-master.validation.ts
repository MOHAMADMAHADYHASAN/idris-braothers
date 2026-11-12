import {
  PlainObject,
  ValidationContext,
  parseBoolean,
  parseString,
  runValidator,
} from '../../common/utils/validators';

export interface CreateUnitMasterInput {
  name: string;
  banglaName?: string;
  category: string;
  isDefault: boolean;
}

export interface UpdateUnitMasterInput {
  name?: string;
  banglaName?: string;
  category?: string;
  isDefault?: boolean;
}

function validateCreateUnitMaster(obj: PlainObject, ctx: ValidationContext): CreateUnitMasterInput {
  return {
    name: parseString(obj, 'name', ctx, {
      required: true,
      min: 1,
      message: 'Unit name is required (e.g. কেজি, প্যাকেট, পিস, বস্তা, কার্টন)',
    }) as string,
    banglaName: parseString(obj, 'banglaName', ctx) ?? undefined,
    category: parseString(obj, 'category', ctx, { defaultVal: 'GENERAL' }) as string,
    isDefault: parseBoolean(obj, 'isDefault', ctx, { defaultVal: false }) as boolean,
  };
}

function validateUpdateUnitMaster(obj: PlainObject, ctx: ValidationContext): UpdateUnitMasterInput {
  const result: UpdateUnitMasterInput = {};
  const name = parseString(obj, 'name', ctx, { min: 1 });
  if (name !== undefined && name !== null) result.name = name;
  const banglaName = parseString(obj, 'banglaName', ctx);
  if (banglaName !== undefined && banglaName !== null) result.banglaName = banglaName;
  const category = parseString(obj, 'category', ctx);
  if (category !== undefined && category !== null) result.category = category;
  const isDefault = parseBoolean(obj, 'isDefault', ctx);
  if (isDefault !== undefined) result.isDefault = isDefault;
  return result;
}

export const parseCreateUnitMaster = (body: unknown): CreateUnitMasterInput =>
  runValidator(validateCreateUnitMaster, body);

export const parseUpdateUnitMaster = (body: unknown): UpdateUnitMasterInput =>
  runValidator(validateUpdateUnitMaster, body);
