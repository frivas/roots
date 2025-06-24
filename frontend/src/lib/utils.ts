import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date based on current language/locale
 */
export function formatDate(date: Date | string | number, language: string = 'en'): string {
  const d = new Date(date);
  
  if (language === 'es' || language === 'es-ES') {
    // Spanish format: DD/MM/YYYY
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } else {
    // English format: MM/DD/YYYY
    return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }
}

/**
 * Format a time based on current language/locale
 */
export function formatTime(date: Date | string | number, language: string = 'en'): string {
  const d = new Date(date);
  
  if (language === 'es' || language === 'es-ES') {
    // Spanish time format (24-hour)
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else {
    // English time format (12-hour)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}