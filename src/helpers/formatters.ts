/**
 * Format a date to a readable string
 */
export const formatDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(
    dateObj,
  );
};

/**
 * Format a date with time
 */
export const formatDateTime = (date: Date | string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return formatDate(date, options);
};

/**
 * Format a price with currency symbol
 */
export const formatPrice = (
  price: number | string,
  currency = 'USD',
): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};

/**
 * Format a number with commas
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Format a relative time (e.g. "2 days ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();

  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);

  // Less than a minute
  if (diffSec < 60) {
    return diffSec <= 1 ? 'just now' : `${diffSec} seconds ago`;
  }

  // Less than an hour
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  }

  // Less than a day
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  }

  // Less than a week
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
  }

  // Less than a month
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) {
    return diffWeek === 1 ? '1 week ago' : `${diffWeek} weeks ago`;
  }

  // Less than a year
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return diffMonth === 1 ? '1 month ago' : `${diffMonth} months ago`;
  }

  // More than a year
  const diffYear = Math.floor(diffDay / 365);
  return diffYear === 1 ? '1 year ago' : `${diffYear} years ago`;
};

/**
 * Truncate text to a specific length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format a file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format a phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format for US phone number: (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phoneNumber;
};
