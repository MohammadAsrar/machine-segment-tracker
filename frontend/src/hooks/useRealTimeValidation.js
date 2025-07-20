import { useState, useEffect } from "react";
import useFormValidation from "./useFormValidation";

/**
 * Custom hook for real-time form validation with enhanced feedback
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function} validateFn - Validation function
 * @param {Object} validationContext - Additional context for validation
 * @param {Object} options - Additional options
 * @returns {Object} - Extended form validation with real-time feedback
 */
const useRealTimeValidation = (
  initialValues = {},
  validateFn,
  validationContext = {},
  options = {}
) => {
  // Default options
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    debounceMs = 300,
  } = options;

  // Use the base form validation hook
  const formValidation = useFormValidation(
    initialValues,
    validateFn,
    validationContext
  );

  // Additional state for real-time validation
  const [fieldStatus, setFieldStatus] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [debounceTimers, setDebounceTimers] = useState({});

  // Validate on mount if needed
  useEffect(() => {
    if (validateOnMount) {
      formValidation.validate();
    }
  }, [validateOnMount]);

  // Enhanced field change handler with debounce
  const handleChangeWithValidation = (field, value) => {
    // Update the form value immediately
    formValidation.handleChange(field, value);

    // Set field status to "validating"
    setFieldStatus((prev) => ({
      ...prev,
      [field]: "validating",
    }));

    setIsValidating(true);

    // Clear existing timer for this field
    if (debounceTimers[field]) {
      clearTimeout(debounceTimers[field]);
    }

    // Set new timer for validation
    if (validateOnChange) {
      const timerId = setTimeout(() => {
        formValidation.validate();

        // Update field status based on validation result
        setFieldStatus((prev) => ({
          ...prev,
          [field]: formValidation.errors[field] ? "error" : "valid",
        }));

        setIsValidating(false);
      }, debounceMs);

      // Store the timer ID
      setDebounceTimers((prev) => ({
        ...prev,
        [field]: timerId,
      }));
    }
  };

  // Enhanced blur handler
  const handleBlurWithValidation = (field) => {
    formValidation.handleBlur(field);

    if (validateOnBlur) {
      // Clear any pending debounce for this field
      if (debounceTimers[field]) {
        clearTimeout(debounceTimers[field]);
      }

      // Validate immediately on blur
      formValidation.validate();

      // Update field status
      setFieldStatus((prev) => ({
        ...prev,
        [field]: formValidation.errors[field] ? "error" : "valid",
      }));
    }
  };

  // Get field status
  const getFieldStatus = (field) => {
    return fieldStatus[field] || "pending";
  };

  // Check if field is validating
  const isFieldValidating = (field) => {
    return fieldStatus[field] === "validating";
  };

  // Check if field is valid
  const isFieldValid = (field) => {
    return fieldStatus[field] === "valid";
  };

  return {
    ...formValidation,
    handleChange: handleChangeWithValidation,
    handleBlur: handleBlurWithValidation,
    getFieldStatus,
    isFieldValidating,
    isFieldValid,
    isValidating,
  };
};

export default useRealTimeValidation;
