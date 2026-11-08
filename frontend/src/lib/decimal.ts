/**
 * Decimal & Currency Utilities for Idris Brothers Grocery & Spice POS
 * Handles 4-decimal precision for micro-spices and standard currency formatting.
 */

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
 * Format currency in Bangladeshi Taka (৳).
 * e.g., 3500 -> "৳3,500.00" or "৳3,500"
 */
export function formatCurrency(amount: number | string | null | undefined, showDecimals: boolean = true): string {
  const num = parseDecimal(amount, 0);
  const formatted = num.toLocaleString('en-BD', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `৳${formatted}`;
}

/**
 * Format weight/quantity up to 4 decimal places for micro-spices.
 * Trims trailing zeroes after decimal point if present.
 * e.g., 0.0056 -> "0.0056", 15.0000 -> "15", 2.5000 -> "2.5"
 */
export function formatWeight(quantity: number | string | null | undefined, unitName: string = 'কেজি'): string {
  const num = parseDecimal(quantity, 0);
  // Up to 4 decimal places without unnecessary trailing zeroes
  const formatted = parseFloat(num.toFixed(4)).toString();
  return `${formatted} ${unitName}`;
}

/**
 * Perform safe division preventing Divide-by-Zero errors.
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (!denominator || denominator === 0 || isNaN(denominator)) return fallback;
  return numerator / denominator;
}
