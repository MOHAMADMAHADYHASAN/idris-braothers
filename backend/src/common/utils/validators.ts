import { AppError } from '../errors/AppError';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export type PlainObject = Record<string, unknown>;

export function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Collects field validation issues during a single pass and throws a unified 422 AppError.
 */
export class ValidationContext {
  private readonly issues: string[] = [];

  addIssue(path: string, message: string): void {
    this.issues.push(path ? `${path}: ${message}` : message);
  }

  hasIssues(): boolean {
    return this.issues.length > 0;
  }

  throwIfInvalid(): void {
    if (this.issues.length > 0) {
      throw new AppError(this.issues.join(', '), 422);
    }
  }
}

export function runValidator<T>(fn: (obj: PlainObject, ctx: ValidationContext) => T, raw: unknown): T {
  if (!isPlainObject(raw)) {
    throw new AppError('Request body must be a JSON object', 422);
  }
  const ctx = new ValidationContext();
  const parsed = fn(raw, ctx);
  ctx.throwIfInvalid();
  return parsed;
}

function joinPath(prefix: string, field: string): string {
  return prefix ? `${prefix}.${field}` : field;
}

export interface StringRuleOptions {
  required?: boolean;
  nullable?: boolean;
  min?: number;
  defaultVal?: string;
  message?: string;
}

export function parseString(
  obj: PlainObject,
  field: string,
  ctx: ValidationContext,
  opts: StringRuleOptions = {},
  prefix = ''
): string | null | undefined {
  const path = joinPath(prefix, field);
  const raw = obj[field];

  if (raw === undefined) {
    if (opts.defaultVal !== undefined) return opts.defaultVal;
    if (opts.required) ctx.addIssue(path, opts.message || `${field} is required`);
    return undefined;
  }
  if (raw === null) {
    if (opts.nullable) return null;
    ctx.addIssue(path, opts.message || `${field} cannot be null`);
    return undefined;
  }
  if (typeof raw !== 'string') {
    ctx.addIssue(path, opts.message || `${field} must be a string`);
    return undefined;
  }
  if (opts.min !== undefined && raw.length < opts.min) {
    ctx.addIssue(path, opts.message || `${field} must be at least ${opts.min} character(s)`);
    return undefined;
  }
  return raw;
}

export function parseUuid(
  obj: PlainObject,
  field: string,
  ctx: ValidationContext,
  opts: { required?: boolean; nullable?: boolean; message?: string } = {},
  prefix = ''
): string | null | undefined {
  const val = parseString(obj, field, ctx, opts, prefix);
  if (typeof val === 'string' && !UUID_REGEX.test(val)) {
    ctx.addIssue(joinPath(prefix, field), opts.message || `Invalid UUID format for ${field}`);
    return undefined;
  }
  return val;
}

export function parseIsoDatetime(
  obj: PlainObject,
  field: string,
  ctx: ValidationContext,
  opts: { required?: boolean; message?: string } = {},
  prefix = ''
): string | undefined {
  const val = parseString(obj, field, ctx, opts, prefix);
  if (typeof val === 'string' && (!ISO_DATETIME_REGEX.test(val) || Number.isNaN(Date.parse(val)))) {
    ctx.addIssue(joinPath(prefix, field), opts.message || `Invalid ISO datetime for ${field}`);
    return undefined;
  }
  return val ?? undefined;
}

export interface NumberRuleOptions {
  required?: boolean;
  nullable?: boolean;
  min?: number;
  positive?: boolean;
  defaultVal?: number;
  message?: string;
}

export function parseNumber(
  obj: PlainObject,
  field: string,
  ctx: ValidationContext,
  opts: NumberRuleOptions = {},
  prefix = ''
): number | null | undefined {
  const path = joinPath(prefix, field);
  const raw = obj[field];

  if (raw === undefined) {
    if (opts.defaultVal !== undefined) return opts.defaultVal;
    if (opts.required) ctx.addIssue(path, opts.message || `${field} is required`);
    return undefined;
  }
  if (raw === null) {
    if (opts.nullable) return null;
    ctx.addIssue(path, opts.message || `${field} cannot be null`);
    return undefined;
  }
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    ctx.addIssue(path, opts.message || `${field} must be a valid number`);
    return undefined;
  }
  if (opts.positive && raw <= 0) {
    ctx.addIssue(path, opts.message || `${field} must be greater than 0`);
    return undefined;
  }
  if (opts.min !== undefined && raw < opts.min) {
    ctx.addIssue(path, opts.message || `${field} must be at least ${opts.min}`);
    return undefined;
  }
  return raw;
}

export function parseBoolean(
  obj: PlainObject,
  field: string,
  ctx: ValidationContext,
  opts: { required?: boolean; defaultVal?: boolean } = {},
  prefix = ''
): boolean | undefined {
  const path = joinPath(prefix, field);
  const raw = obj[field];

  if (raw === undefined) {
    if (opts.defaultVal !== undefined) return opts.defaultVal;
    if (opts.required) ctx.addIssue(path, `${field} is required`);
    return undefined;
  }
  if (typeof raw !== 'boolean') {
    ctx.addIssue(path, `${field} must be a boolean`);
    return undefined;
  }
  return raw;
}

export function parseEnum<T extends string>(
  obj: PlainObject,
  field: string,
  allowed: readonly T[],
  ctx: ValidationContext,
  opts: { required?: boolean; defaultVal?: T; message?: string } = {},
  prefix = ''
): T | undefined {
  const path = joinPath(prefix, field);
  const raw = obj[field];

  if (raw === undefined) {
    if (opts.defaultVal !== undefined) return opts.defaultVal;
    if (opts.required) ctx.addIssue(path, opts.message || `${field} is required`);
    return undefined;
  }
  if (typeof raw !== 'string' || !allowed.includes(raw as T)) {
    ctx.addIssue(path, opts.message || `${field} must be one of: ${allowed.join(', ')}`);
    return undefined;
  }
  return raw as T;
}

export function parseRecord(
  obj: PlainObject,
  field: string,
  ctx: ValidationContext,
  opts: { defaultEmpty?: boolean } = {},
  prefix = ''
): Record<string, unknown> | undefined {
  const path = joinPath(prefix, field);
  const raw = obj[field];

  if (raw === undefined) {
    return opts.defaultEmpty ? {} : undefined;
  }
  if (!isPlainObject(raw)) {
    ctx.addIssue(path, `${field} must be a JSON object`);
    return undefined;
  }
  return raw;
}

export function parseArray<T>(
  obj: PlainObject,
  field: string,
  itemParser: (item: PlainObject, ctx: ValidationContext, prefix: string) => T,
  ctx: ValidationContext,
  opts: { required?: boolean; minLen?: number; defaultEmpty?: boolean; message?: string } = {},
  prefix = ''
): T[] | undefined {
  const path = joinPath(prefix, field);
  const raw = obj[field];

  if (raw === undefined) {
    if (opts.defaultEmpty) return [];
    if (opts.required) ctx.addIssue(path, opts.message || `${field} is required`);
    return undefined;
  }
  if (!Array.isArray(raw)) {
    ctx.addIssue(path, opts.message || `${field} must be an array`);
    return undefined;
  }
  if (opts.minLen !== undefined && raw.length < opts.minLen) {
    ctx.addIssue(path, opts.message || `${field} must contain at least ${opts.minLen} item(s)`);
    return undefined;
  }

  return raw.map((el, idx) => {
    const itemPath = `${path}[${idx}]`;
    if (!isPlainObject(el)) {
      ctx.addIssue(itemPath, 'Each item must be a JSON object');
      return {} as T;
    }
    return itemParser(el, ctx, itemPath);
  });
}
