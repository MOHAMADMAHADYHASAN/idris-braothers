/**
 * Bangladeshi Phone Number Utilities (Normalization, Validation, Gateway Conversion)
 *
 * Supported formats:
 * - 01712345678 (Standard local format)
 * - +8801712345678 (International format with plus)
 * - 8801712345678 (International format without plus)
 * - 01712-345678 / 01712 345 678 (Separated by hyphen or space)
 * - 1712345678 (10 digits without leading 0)
 * - বাংলা সংখ্যা: ০১৭১২৩৪৫৬৭৮ / +৮৮০১৭১২৩৪৫৬৭৮
 *
 * Operator Prefixes:
 * - 013, 017 (Grameenphone)
 * - 014, 019 (Banglalink)
 * - 015 (Teletalk)
 * - 016, 018 (Robi / Airtel)
 */

import { ValidationContext, joinPath, PlainObject } from './validators';

const BANGLA_TO_ASCII: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

/**
 * Converts Bengali numerals to ASCII English numerals.
 */
export function toEnglishDigits(raw: string): string {
  if (!raw) return '';
  return raw.replace(/[০-৯]/g, (ch) => BANGLA_TO_ASCII[ch] || ch);
}

/**
 * Normalizes any Bangladeshi phone input into a standard 11-digit local format: "01XXXXXXXXX".
 * Strips spaces, dashes, brackets, dots, country codes (+880, 880), and ensures leading 0.
 */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return '';
  // 1. Convert Bengali numerals to ASCII digits
  let p = toEnglishDigits(String(raw));
  // 2. Remove whitespace, hyphens, brackets, dots
  p = p.replace(/[\s\-\(\)\.]/g, '');
  // 3. Remove country code (+880 or 880 when 13 digits)
  if (p.startsWith('+880')) {
    p = p.slice(4);
  } else if (p.startsWith('880') && p.length === 13) {
    p = p.slice(3);
  }
  // 4. Prepend leading 0 if user enters 10 digits without 0 (e.g. "17XXXXXXXX")
  if (p.length === 10 && !p.startsWith('0')) {
    p = '0' + p;
  }
  return p;
}

/**
 * Bangladeshi valid mobile operator regex:
 * Starts with 013, 014, 015, 016, 017, 018, or 019, followed by 8 digits (total 11 digits).
 */
export const BD_PHONE_REGEX = /^(01[3-9])\d{8}$/;

/**
 * Validates whether the given phone number is a valid Bangladeshi mobile number.
 */
export function isValidBDPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  return BD_PHONE_REGEX.test(normalizePhone(phone));
}

/**
 * Formats a phone number for SMS Gateways, Meta CAPI, or WhatsApp (8801XXXXXXXXX format).
 */
export function toGatewayPhone(phone: string | null | undefined): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return '';
  return normalized.startsWith('0') ? `880${normalized.slice(1)}` : `880${normalized}`;
}

/**
 * Formats phone number for display (e.g., "01712-345678").
 */
export function formatPhone(phone: string | null | undefined, separator = '-'): string {
  const norm = normalizePhone(phone);
  if (norm.length === 11) {
    return `${norm.slice(0, 5)}${separator}${norm.slice(5)}`;
  }
  return norm || (phone ? String(phone) : '');
}

export interface PhoneRuleOptions {
  required?: boolean;
  nullable?: boolean;
  message?: string;
}

/**
 * Validation helper for DTO schemas in the backend.
 * Parses, normalizes, and validates Bangladeshi phone numbers.
 */
export function parsePhone(
  obj: PlainObject,
  field: string,
  ctx: ValidationContext,
  opts: PhoneRuleOptions = {},
  prefix = ''
): string | null | undefined {
  const path = joinPath(prefix, field);
  const raw = obj[field];

  if (raw === undefined) {
    if (opts.required) ctx.addIssue(path, opts.message || `${field} is required`);
    return undefined;
  }
  if (raw === null || (typeof raw === 'string' && raw.trim() === '')) {
    if (opts.nullable) return null;
    if (opts.required) ctx.addIssue(path, opts.message || `${field} cannot be null or empty`);
    return undefined;
  }
  if (typeof raw !== 'string') {
    ctx.addIssue(path, opts.message || `${field} must be a string`);
    return undefined;
  }

  const normalized = normalizePhone(raw);
  if (!isValidBDPhone(normalized)) {
    ctx.addIssue(
      path,
      opts.message || `${field} must be a valid 11-digit Bangladeshi mobile number (013-019)`
    );
    return undefined;
  }
  return normalized;
}
