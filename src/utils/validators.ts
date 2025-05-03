/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength (min 8 chars, must include letters and numbers)
 */
export const isStrongPassword = (password: string): boolean => {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasLetter && hasNumber;
};

/**
 * Get password strength score (0-4)
 * 0: Very weak
 * 1: Weak
 * 2: Medium
 * 3: Strong
 * 4: Very strong
 */
export const getPasswordStrength = (password: string): number => {
  let score = 0;

  // Min length
  if (password.length >= 8) score += 1;

  // Contains lowercase
  if (/[a-z]/.test(password)) score += 1;

  // Contains uppercase
  if (/[A-Z]/.test(password)) score += 1;

  // Contains number
  if (/\d/.test(password)) score += 1;

  // Contains special char
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  return Math.min(4, Math.floor(score * 0.8));
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate a form object
 */
export const validateForm = <T extends Record<string, any>>(
  values: T,
  validationRules: Record<keyof T, (value: any) => string | null>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach((key) => {
    const value = values[key];
    const validateField = validationRules[key as keyof T];
    const error = validateField(value);

    if (error) {
      errors[key] = error;
    }
  });

  return errors;
};

/**
 * Create field validator
 */
export const createValidator = <T extends Record<string, any>>(
  validationRules: Record<keyof T, (value: any) => string | null>,
) => {
  return (values: T) => validateForm(values, validationRules);
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: (fieldName: string) => (value: any) =>
    value ? null : `${fieldName} is required`,

  email: () => (value: string) =>
    !value || isValidEmail(value) ? null : 'Invalid email address',

  minLength: (fieldName: string, min: number) => (value: string) =>
    !value || value.length >= min
      ? null
      : `${fieldName} must be at least ${min} characters`,

  maxLength: (fieldName: string, max: number) => (value: string) =>
    !value || value.length <= max
      ? null
      : `${fieldName} must be no more than ${max} characters`,

  password: () => (value: string) =>
    !value || isStrongPassword(value)
      ? null
      : 'Password must be at least 8 characters and include both letters and numbers',

  url: (fieldName: string) => (value: string) =>
    !value || isValidUrl(value)
      ? null
      : `Please enter a valid URL for ${fieldName}`,

  numeric: (fieldName: string) => (value: string) =>
    !value || !isNaN(Number(value)) ? null : `${fieldName} must be a number`,

  phoneNumber: () => (value: string) => {
    if (!value) return null;

    // Basic phone validation (numbers, spaces, dashes, parentheses, and plus sign)
    const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number';
  },
};
