export interface ValidationRule<T = any> {
  message: string;
  validator: (value: T) => boolean;
}

export const createValidator = <T>(rules: ValidationRule<T>[]) => {
  return (value: T): string | null => {
    for (const rule of rules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
    return null;
  };
};

export const validationRules = {
  required: (message = 'Trường này là bắt buộc'): ValidationRule<any> => ({
    message,
    validator: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value != null && value !== '';
    },
  }),

  email: (message = 'Email không hợp lệ'): ValidationRule<string> => ({
    message,
    validator: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    message: message || `Tối thiểu ${min} ký tự`,
    validator: (value) => value.length >= min,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    message: message || `Tối đa ${max} ký tự`,
    validator: (value) => value.length <= max,
  }),

  phoneNumber: (
    message = 'Số điện thoại không hợp lệ',
  ): ValidationRule<string> => ({
    message,
    validator: (value) => {
      const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    },
  }),

  url: (message = 'URL không hợp lệ'): ValidationRule<string> => ({
    message,
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  }),

  numeric: (message = 'Chỉ được nhập số'): ValidationRule<string> => ({
    message,
    validator: (value) => /^\d+$/.test(value),
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    message: message || `Giá trị tối thiểu là ${min}`,
    validator: (value) => value >= min,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    message: message || `Giá trị tối đa là ${max}`,
    validator: (value) => value <= max,
  }),

  matches: (regex: RegExp, message: string): ValidationRule<string> => ({
    message,
    validator: (value) => regex.test(value),
  }),

  fileSize: (maxSizeMB: number, message?: string): ValidationRule<File> => ({
    message: message || `Kích thước file tối đa là ${maxSizeMB}MB`,
    validator: (file) => file.size <= maxSizeMB * 1024 * 1024,
  }),

  fileType: (
    allowedTypes: string[],
    message?: string,
  ): ValidationRule<File> => ({
    message: message || `Chỉ chấp nhận file: ${allowedTypes.join(', ')}`,
    validator: (file) => allowedTypes.includes(file.type),
  }),
};

export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, ValidationRule<any>[]>>,
): Record<keyof T, string> => {
  const errors = {} as Record<keyof T, string>;

  for (const field in rules) {
    const fieldRules = rules[field];
    const value = data[field];

    if (fieldRules) {
      for (const rule of fieldRules) {
        if (!rule.validator(value)) {
          errors[field] = rule.message;
          break; // Stop at first error
        }
      }
    }
  }

  return errors;
};
