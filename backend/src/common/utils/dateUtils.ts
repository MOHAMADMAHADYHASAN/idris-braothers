/**
 * Calculate start of day (00:00:00.000) and end of day (23:59:59.999)
 */
export const getDayBoundaries = (dateInput?: Date | string): { startOfDay: Date; endOfDay: Date } => {
  const d = dateInput ? new Date(dateInput) : new Date();

  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

/**
 * Build Prisma date range filter ({ gte, lte })
 */
export const buildDateRangeFilter = (
  startDate?: string | Date,
  endDate?: string | Date
): { gte?: Date; lte?: Date } | undefined => {
  if (!startDate && !endDate) return undefined;

  const filter: { gte?: Date; lte?: Date } = {};

  if (startDate) {
    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);
    filter.gte = s;
  }

  if (endDate) {
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    filter.lte = e;
  }

  return filter;
};
