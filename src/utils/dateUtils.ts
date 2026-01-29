/**
 * Date Utilities
 *
 * Utility functions for date formatting and relative time display
 */

/**
 * Format a timestamp as relative time (today, tomorrow, overdue, etc.)
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (timestamp: number | null): string | null => {
  if (timestamp === null) return null;

  const now = new Date();
  const date = new Date(timestamp);

  // Reset time to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Overdue';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`;
  } else {
    // Format as date for far future dates
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
};

/**
 * Check if a date is overdue
 * @param timestamp Unix timestamp in milliseconds
 * @returns True if the date is in the past
 */
export const isOverdue = (timestamp: number | null): boolean => {
  if (timestamp === null) return false;

  const now = new Date();
  const date = new Date(timestamp);

  // Reset time to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return targetDate.getTime() < today.getTime();
};
