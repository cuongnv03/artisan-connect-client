import { useState, useCallback, ChangeEvent } from 'react';

interface FormErrors {
  [key: string]: string;
}

interface FormOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>(
  options: FormOptions<T>,
) {
  const { initialValues, validate, onSubmit } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set a specific field value
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  }, []);

  // Set a specific field error
  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  }, []);

  // Mark a field as touched
  const setFieldTouched = useCallback((name: string, isTouched = true) => {
    setTouched((prevTouched) => ({ ...prevTouched, [name]: isTouched }));
  }, []);

  // Handle change for regular inputs
  const handleChange = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, type, value, checked } = e.target as HTMLInputElement;

      setValues((prevValues) => ({
        ...prevValues,
        [name]: type === 'checkbox' ? checked : value,
      }));
    },
    [],
  );

  // Handle blur to mark field as touched
  const handleBlur = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name } = e.target;
      setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));

      // Validate field on blur if validate function exists
      if (validate) {
        const validationErrors = validate(values);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: validationErrors[name] || '',
        }));
      }
    },
    [validate, values],
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validate) return {};

    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [validate, values]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      // Increment submit count
      setSubmitCount((c) => c + 1);

      // Mark all fields as touched
      const touchedFields = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setTouched(touchedFields);

      // Validate form
      const validationErrors = validateForm();
      const isValid = Object.keys(validationErrors).length === 0;

      if (isValid && onSubmit) {
        try {
          setIsSubmitting(true);
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validateForm, onSubmit, values],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateForm,
  };
}
