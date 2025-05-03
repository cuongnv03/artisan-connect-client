/**
 * Application constants
 */
export const APP_NAME = 'Artisan Connect';
export const APP_DESCRIPTION =
  'Connecting artisans with customers through stories and craftsmanship';
export const APP_VERSION = '1.0.0';

/**
 * API configuration
 */
export const API_URL =
  import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Auth constants
 */
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const TOKEN_EXPIRY_BUFFER = 60 * 1000; // 1 minute buffer before token expiry

/**
 * UI constants
 */
export const DEFAULT_AVATAR = '/assets/images/default-avatar.png';
export const DEFAULT_COVER = '/assets/images/default-cover.jpg';

/**
 * Form constants
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  ARTISAN: 'ARTISAN',
  CUSTOMER: 'CUSTOMER',
};

/**
 * User statuses
 */
export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
};
