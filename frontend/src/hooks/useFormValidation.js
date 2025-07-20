import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for form validation
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function} validateFn - Validation function
 * @param {Object} validationContext - Additional context for validation
 * @returns {Object} - Form state, errors, handlers, and validation status
 */
const useFormValidation = (
  initialValues = {},
  validateFn,
  validationContext = {}
) => {
  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Validate the form
  const validate = useCallback(() => {
    if (!validateFn) return { isValid: true, errors: {} };

    const validationResult = validateFn(values, validationContext);
    setErrors(validationResult.errors || {});
    setIsValid(validationResult.isValid);

    return validationResult;
  }, [values, validateFn, validationContext]);

  // Update validation when values change
  useEffect(() => {
    if (isDirty) {
      validate();
    }
  }, [values, isDirty, validate]);

  // Handle field change
  const handleChange = useCallback(
    (field, value) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));

      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      if (!isDirty) {
        setIsDirty(true);
      }
    },
    [isDirty]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field) => {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      if (!isDirty) {
        setIsDirty(true);
        validate();
      }
    },
    [isDirty, validate]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit) => {
      return async (event) => {
        if (event) {
          event.preventDefault();
        }

        setTouched(
          Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {})
        );

        setIsDirty(true);
        setIsSubmitting(true);

        const validationResult = validate();

        if (validationResult.isValid) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error("Form submission error:", error);
            setErrors((prev) => ({
              ...prev,
              submit: error.message || "Form submission failed",
            }));
          }
        }

        setIsSubmitting(false);
      };
    },
    [values, validate]
  );

  // Reset the form
  const resetForm = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setIsDirty(false);
    },
    [initialValues]
  );

  // Set a specific field value
  const setFieldValue = useCallback(
    (field, value) => {
      handleChange(field, value);
    },
    [handleChange]
  );

  // Set a specific field error
  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  // Set multiple field values at once
  const setFieldValues = useCallback(
    (newValues) => {
      setValues((prev) => ({
        ...prev,
        ...newValues,
      }));

      // Mark fields as touched
      const touchedFields = Object.keys(newValues).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});

      setTouched((prev) => ({
        ...prev,
        ...touchedFields,
      }));

      if (!isDirty) {
        setIsDirty(true);
      }
    },
    [isDirty]
  );

  // Check if a field has an error and has been touched
  const hasError = useCallback(
    (field) => {
      return Boolean(touched[field] && errors[field]);
    },
    [touched, errors]
  );

  // Get the error message for a field
  const getErrorMessage = useCallback(
    (field) => {
      return hasError(field) ? errors[field] : "";
    },
    [hasError, errors]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setFieldValues,
    hasError,
    getErrorMessage,
    validate,
  };
};

export default useFormValidation;
