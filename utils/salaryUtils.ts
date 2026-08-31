/**
 * salaryUtils.ts — Shared math helpers for salary calculations.
 * All business logic must go through salaryCalculation.service.ts.
 * These are pure utility functions only.
 */

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Format a number as Indian currency string, e.g. 1234567 → "₹12,34,567" */
export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  const str = rounded.toString();
  if (str.length <= 3) return `₹${str}`;

  // Indian format: last 3 digits, then groups of 2
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${formatted},${last3}`;
}

/** Return month name from month number (1-12) */
export function monthName(month: number): string {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return names[month - 1] ?? '';
}

/** Returns "August 2026" style pay period string */
export function payPeriodLabel(year: number, month: number): string {
  return `${monthName(month)} ${year}`;
}
