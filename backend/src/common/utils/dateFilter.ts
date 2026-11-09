/**
 * Production-Grade Timezone-Safe Date Filter Architecture (Asia/Dhaka UTC+06:00)
 * Eliminates server/client timezone mismatch offset bugs (12:00 AM - 06:00 AM order drop).
 * Provides automatic previous-period delta/growth comparison window.
 */

const TIMEZONE = 'Asia/Dhaka';

const ymdFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Converts any Date object to exact local "YYYY-MM-DD" in Asia/Dhaka
 */
export function formatToYmd(date: Date): string {
  const parts = ymdFormatter.formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Start of Day in Bangladesh Time: 00:00:00.000+06:00 (UTC 18:00:00.000 of prev day)
 */
export function getDayStart(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000+06:00`);
}

/**
 * End of Day in Bangladesh Time: 23:59:59.999+06:00 (UTC 17:59:59.999)
 */
export function getDayEnd(ymd: string): Date {
  return new Date(`${ymd}T23:59:59.999+06:00`);
}

/**
 * Safe day addition/subtraction in local timezone
 */
export function addDays(ymd: string, days: number): string {
  const d = getDayStart(ymd);
  const target = new Date(d.getTime() + days * 86_400_000);
  return formatToYmd(target);
}

export function isValidYmd(str?: string | null): boolean {
  return Boolean(str && /^\d{4}-\d{2}-\d{2}$/.test(str));
}

export interface ResolvedDateRange {
  filter: string;
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  startYmd: string;
  endYmd: string;
  numDays: number;
}

/**
 * Global Resolver: Converts query params into Prisma-ready, timezone-safe Date ranges
 * along with matching previous-period comparison boundaries.
 */
export function resolveDateFilter(searchParams?: {
  filter?: string;
  startDate?: string;
  endDate?: string;
}): ResolvedDateRange {
  const todayYmd = formatToYmd(new Date());
  let filter = searchParams?.filter || 'today';
  let startYmd = todayYmd;
  let endYmd = todayYmd;
  let startDate: Date;
  let endDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;
  let numDays = 1;

  if (filter === 'today') {
    numDays = 1;
    startYmd = todayYmd;
    endYmd = todayYmd;
    startDate = getDayStart(startYmd);
    endDate = getDayEnd(endYmd);
    prevStartDate = getDayStart(addDays(startYmd, -1));
    prevEndDate = getDayEnd(addDays(endYmd, -1));
  } else if (filter === 'yesterday') {
    numDays = 1;
    startYmd = addDays(todayYmd, -1);
    endYmd = startYmd;
    startDate = getDayStart(startYmd);
    endDate = getDayEnd(endYmd);
    prevStartDate = getDayStart(addDays(startYmd, -1));
    prevEndDate = getDayEnd(addDays(endYmd, -1));
  } else if (filter === 'weekly' || filter === '7days') {
    numDays = 7;
    startYmd = addDays(todayYmd, -6);
    endYmd = todayYmd;
    startDate = getDayStart(startYmd);
    endDate = getDayEnd(endYmd);
    prevStartDate = getDayStart(addDays(startYmd, -7));
    prevEndDate = getDayEnd(addDays(startYmd, -1));
  } else if (filter === 'monthly' || filter === '30days') {
    numDays = 30;
    startYmd = addDays(todayYmd, -29);
    endYmd = todayYmd;
    startDate = getDayStart(startYmd);
    endDate = getDayEnd(endYmd);
    prevStartDate = getDayStart(addDays(startYmd, -30));
    prevEndDate = getDayEnd(addDays(startYmd, -1));
  } else if (filter === 'yearly') {
    numDays = 365;
    startYmd = addDays(todayYmd, -364);
    endYmd = todayYmd;
    startDate = getDayStart(startYmd);
    endDate = getDayEnd(endYmd);
    prevStartDate = getDayStart(addDays(startYmd, -365));
    prevEndDate = getDayEnd(addDays(startYmd, -1));
  } else if (filter === 'all') {
    numDays = 999999;
    startYmd = '1970-01-01';
    endYmd = todayYmd;
    startDate = new Date(0);
    endDate = getDayEnd(todayYmd);
    prevStartDate = new Date(0);
    prevEndDate = new Date(0);
  } else {
    // Custom date range
    filter = 'custom';
    let rawStart = isValidYmd(searchParams?.startDate)
      ? searchParams!.startDate!
      : addDays(todayYmd, -6);
    let rawEnd = isValidYmd(searchParams?.endDate)
      ? searchParams!.endDate!
      : todayYmd;

    // Auto-swap if start > end
    if (rawStart > rawEnd) {
      const temp = rawStart;
      rawStart = rawEnd;
      rawEnd = temp;
    }

    startYmd = rawStart;
    endYmd = rawEnd;
    startDate = getDayStart(startYmd);
    endDate = getDayEnd(endYmd);

    numDays =
      Math.max(
        1,
        Math.round(
          (getDayStart(endYmd).getTime() - getDayStart(startYmd).getTime()) /
            86_400_000
        )
      ) + 1;

    prevStartDate = getDayStart(addDays(startYmd, -numDays));
    prevEndDate = getDayEnd(addDays(startYmd, -1));
  }

  return {
    filter,
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    startYmd,
    endYmd,
    numDays,
  };
}
