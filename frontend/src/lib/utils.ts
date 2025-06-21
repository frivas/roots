import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date using Spanish locale for consistency
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  // Use Spanish date format (DD/MM/YYYY) - consistent with Spanish regional settings
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a time using Spanish locale for consistency (24-hour format)
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  // Use Spanish time format (24-hour) - consistent with Spanish regional settings
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}