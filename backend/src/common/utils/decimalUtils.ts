import { Prisma } from '@prisma/client';

/**
 * Safely convert any value to Prisma.Decimal
 */
export const toDecimal = (val: unknown, fallback = 0): Prisma.Decimal => {
  if (val instanceof Prisma.Decimal) return val;
  if (val === null || val === undefined || val === '') return new Prisma.Decimal(fallback);
  try {
    return new Prisma.Decimal(val as Prisma.Decimal.Value);
  } catch {
    return new Prisma.Decimal(fallback);
  }
};

/**
 * Perform safe division preventing DivisionByZero errors
 */
export const safeDiv = (
  numerator: Prisma.Decimal | number,
  denominator: Prisma.Decimal | number,
  decimals = 4
): Prisma.Decimal => {
  const num = toDecimal(numerator);
  const den = toDecimal(denominator);

  if (den.isZero()) {
    return new Prisma.Decimal(0);
  }

  return num.div(den).toDecimalPlaces(decimals);
};

/**
 * Calculate margin percentage string safely (e.g. "8.26%")
 */
export const calculateMarginPercent = (
  profit: Prisma.Decimal | number,
  revenue: Prisma.Decimal | number,
  decimals = 2
): string => {
  const p = toDecimal(profit);
  const r = toDecimal(revenue);

  if (r.isZero() || r.isNegative()) {
    return '0.00%';
  }

  return `${p.div(r).mul(100).toNumber().toFixed(decimals)}%`;
};
