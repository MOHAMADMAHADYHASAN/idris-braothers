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
 * Strips whitespace, hyphens, brackets, dots, and handles country code (+880 / 880).
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
 * Regex for valid Bangladeshi mobile operator numbers:
 * 013 (GP), 014 (Banglalink), 015 (Teletalk), 016 (Airtel/Robi),
 * 017 (GP), 018 (Robi), 019 (Banglalink) followed by 8 digits. Total: 11 digits.
 */
export const BD_PHONE_REGEX = /^(01[3-9])\d{8}$/;

/**
 * Validates whether the given raw phone number is a valid Bangladeshi mobile number.
 */
export function isValidBDPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  return BD_PHONE_REGEX.test(normalizePhone(phone));
}

/**
 * Formats a normalized phone number for SMS Gateways / Meta CAPI / WhatsApp (8801XXXXXXXXX).
 */
export function toGatewayPhone(phone: string | null | undefined): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return '';
  return normalized.startsWith('0') ? `880${normalized.slice(1)}` : `880${normalized}`;
}

/**
 * Formats phone number for display (e.g., 01712-345678).
 */
export function formatPhone(phone: string | null | undefined, separator = '-'): string {
  const norm = normalizePhone(phone);
  if (norm.length === 11) {
    return `${norm.slice(0, 5)}${separator}${norm.slice(5)}`;
  }
  return norm || (phone ? String(phone) : '');
}
