import { useState } from 'react';

export const useFormValidation = (initialValues, validateRule) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: val }));

    if (validateRule) {
      const fieldErrors = validateRule({ ...values, [name]: val });
      setErrors(fieldErrors);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validateRule) {
      const fieldErrors = validateRule(values);
      setErrors(fieldErrors);
    }
  };

  const validateAll = () => {
    if (validateRule) {
      const fieldErrors = validateRule(values);
      setErrors(fieldErrors);
      // Touch all
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      return Object.keys(fieldErrors).length === 0;
    }
    return true;
  };

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
  };
};

export default useFormValidation;
