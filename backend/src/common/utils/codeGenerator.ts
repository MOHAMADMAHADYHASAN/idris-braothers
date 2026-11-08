/**
 * Generate human-readable date-prefixed sequential document code
 * Example: generateDailySequenceCode('INV', 0) -> "INV-261108-0001"
 */
export const generateDailySequenceCode = (
  prefix: string,
  countToday: number,
  dateInput: Date = new Date(),
  padding = 4
): string => {
  const year = dateInput.getFullYear().toString().slice(-2);
  const month = (dateInput.getMonth() + 1).toString().padStart(2, '0');
  const day = dateInput.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  const sequence = (countToday + 1).toString().padStart(padding, '0');

  return `${prefix}-${datePrefix}-${sequence}`;
};
