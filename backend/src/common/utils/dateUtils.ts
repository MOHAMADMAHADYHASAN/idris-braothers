import { formatToYmd, getDayStart, getDayEnd } from './dateFilter';

/**
 * Calculate start of day (00:00:00.000) and end of day (23:59:59.999) in Asia/Dhaka (UTC+06:00)
 */
export const getDayBoundaries = (dateInput?: Date | string): { startOfDay: Date; endOfDay: Date } => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const ymd = formatToYmd(d);
  return {
    startOfDay: getDayStart(ymd),
    endOfDay: getDayEnd(ymd),
  };
};

/**
 * Build Prisma date range filter ({ gte, lte }) with strict Asia/Dhaka timezone alignment
 */
export const buildDateRangeFilter = (
  startDate?: string | Date,
  endDate?: string | Date
): { gte?: Date; lte?: Date } | undefined => {
  if (!startDate && !endDate) return undefined;

  const filter: { gte?: Date; lte?: Date } = {};

  if (startDate) {
    const startYmd =
      typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
        ? startDate
        : formatToYmd(new Date(startDate));
    filter.gte = getDayStart(startYmd);
  }

  if (endDate) {
    const endYmd =
      typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate)
        ? endDate
        : formatToYmd(new Date(endDate));
    filter.lte = getDayEnd(endYmd);
  }

  return filter;
};

export * from './dateFilter';
