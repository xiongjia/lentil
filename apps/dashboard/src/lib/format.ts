/**
 * Format a Date or ISO string for display with seconds precision.
 * Returns "—" for invalid or missing dates.
 */
export const formatDateTime = (d: Date | string): string => {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};
