/**
 * Decimal, Currency, Weight, Number & Bangla Date Utilities
 * Single Source of Truth for `bn-BD` Bangla numeral formatting across the ERP.
 */

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const DHAKA_TZ = 'Asia/Dhaka';

/**
 * Convert ASCII digits (0-9) inside any string/number to Bangla digits (০-৯).
 * Note: Never pass hardware barcode SVG values or HTML <input type="number"> raw values here.
 */
export function toBanglaDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\d/g, (digit) => BANGLA_DIGITS[Number(digit)]);
}

/**
 * Safely parse a value (string or number from Prisma Decimal) into a JavaScript number.
 */
export function parseDecimal(val: string | number | null | undefined, fallback: number = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Format any numeric quantity or integer in `bn-BD` Bangla digits with proper grouping.
 * e.g., 1250 -> "১,২৫০", 2.5 -> "২.৫", 0.0056 -> "০.০০৫৬"
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: { minDecimals?: number; maxDecimals?: number; useGrouping?: boolean } = {}
): string {
  const num = parseDecimal(value, 0);
  const { minDecimals = 0, maxDecimals = 4, useGrouping = true } = options;
  return num.toLocaleString('bn-BD', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: Math.max(minDecimals, maxDecimals),
    useGrouping,
  });
}

/**
 * Format currency in Bangladeshi Taka (৳) using `bn-BD` Bangla numerals.
 * e.g., 3500 -> "৳৩,৫০০.০০" or "৳৩,৫০০"
 */
export function formatCurrency(amount: number | string | null | undefined, showDecimals: boolean = true): string {
  const num = parseDecimal(amount, 0);
  const formatted = num.toLocaleString('bn-BD', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `৳${formatted}`;
}

/**
 * Compact Taka label in Bangla for KPI cards (with click-to-toggle exact value).
 * e.g., 125000 -> "১.৩ লাখ", 15400 -> "১৫.৪ হাজার"
 */
export function formatCompactTaka(amount: number | string | null | undefined): string {
  const num = parseDecimal(amount, 0);
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}${formatNumber(abs / 10000000, { minDecimals: 1, maxDecimals: 2 })} কোটি`;
  }
  if (abs >= 100000) {
    return `${sign}${formatNumber(abs / 100000, { minDecimals: 1, maxDecimals: 1 })} লাখ`;
  }
  if (abs >= 1000) {
    return `${sign}${formatNumber(abs / 1000, { minDecimals: 1, maxDecimals: 1 })} হাজার`;
  }
  return `${sign}${formatNumber(abs, { minDecimals: 0, maxDecimals: 2 })}`;
}

/**
 * Format weight/quantity up to 4 decimal places for micro-spices in `bn-BD` Bangla numerals.
 * Trims unnecessary trailing zeroes after decimal point.
 * e.g., 0.0056 -> "০.০০৫৬ কেজি", 15.0000 -> "১৫ কেজি"
 */
export function formatWeight(quantity: number | string | null | undefined, unitName: string = 'কেজি'): string {
  const num = parseDecimal(quantity, 0);
  const cleaned = parseFloat(num.toFixed(4));
  const formatted = cleaned.toLocaleString('bn-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
  return `${formatted} ${unitName}`;
}

/**
 * Format percentages cleanly in Bangla numerals (e.g., "+২৫%" or "১২.৫%").
 */
export function formatPercent(
  value: number | string | null | undefined,
  decimals: number = 0,
  showPlusSign: boolean = false
): string {
  const num = parseDecimal(value, 0);
  const prefix = showPlusSign && num > 0 ? '+' : num < 0 ? '-' : '';
  const formatted = Math.abs(num).toLocaleString('bn-BD', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${prefix}${formatted}%`;
}

/**
 * Helper to safely parse and validate a Date input (Date, string, number, null, undefined).
 * Returns a valid Date instance or null if invalid/empty.
 */
function toValidDate(date: Date | string | number | null | undefined): Date | null {
  if (date === null || date === undefined || date === '') return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Format dates consistently in `bn-BD` (Asia/Dhaka timezone).
 */
export function formatDateBn(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  const d = toValidDate(date);
  if (!d) return '—';
  return d.toLocaleDateString('bn-BD', { timeZone: DHAKA_TZ, ...options });
}

function getDhakaPeriodLabel(d: Date): string {
  const hour24 =
    Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: DHAKA_TZ,
        hour12: false,
        hour: 'numeric',
      }).format(d)
    ) % 24;

  if (hour24 >= 5 && hour24 < 12) return 'সকাল';
  if (hour24 >= 12 && hour24 < 15) return 'দুপুর';
  if (hour24 >= 15 && hour24 < 18) return 'বিকেল';
  if (hour24 >= 18 && hour24 < 20) return 'সন্ধ্যা';
  return 'রাত';
}

/**
 * Format time consistently in `bn-BD` with natural Bengali period (Asia/Dhaka timezone).
 */
export function formatTimeBn(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
): string {
  const d = toValidDate(date);
  if (!d) return '—';
  const raw = d.toLocaleTimeString('bn-BD', { timeZone: DHAKA_TZ, ...options });
  if (options.hour12 === false) return raw;
  const cleanedTime = raw.replace(/\s*(?:AM|PM|am|pm|পূর্বাহ্ণ|অপরাহ্ণ)\s*/g, '').trim();
  return `${getDhakaPeriodLabel(d)} ${cleanedTime}`;
}

/**
 * Format full date + time in `bn-BD` with natural Bengali period (Asia/Dhaka timezone).
 */
export function formatDateTimeBn(date: Date | string | number | null | undefined): string {
  const d = toValidDate(date);
  if (!d) return '—';
  return `${formatDateBn(d, { day: 'numeric', month: 'short', year: 'numeric' })}, ${formatTimeBn(d)}`;
}

/**
 * Perform safe division preventing Divide-by-Zero errors.
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (!denominator || denominator === 0 || isNaN(denominator)) return fallback;
  return numerator / denominator;
}
