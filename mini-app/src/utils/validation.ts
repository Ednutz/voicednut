import { ValidationResult, FormFieldError } from '../types/api';

/**
 * Validates a phone number in E.164 format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone.trim());
};

/**
 * Validates an email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates minimum text length
 */
export const validateMinLength = (text: string, minLength: number): boolean => {
  return text.trim().length >= minLength;
};

/**
 * Validates maximum text length
 */
export const validateMaxLength = (text: string, maxLength: number): boolean => {
  return text.trim().length <= maxLength;
};

/**
 * Validates that a field is not empty
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates Telegram user ID
 */
export const validateTelegramId = (id: string): boolean => {
  const numericId = parseInt(id);
  return !isNaN(numericId) && numericId > 0 && numericId.toString() === id.trim();
};

/**
 * Validates username format (alphanumeric and underscores)
 */
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/;
  return usernameRegex.test(username.trim());
};

/**
 * Comprehensive form validation
 */
export const validateForm = (
  fields: Record<string, string>,
  rules: Record<
    string,
    Array<{
      type: 'required' | 'phone' | 'email' | 'minLength' | 'maxLength' | 'telegramId' | 'username';
      value?: number;
      message: string;
    }>
  >
): ValidationResult => {
  const errors: FormFieldError[] = [];

  Object.entries(rules).forEach(([fieldName, fieldRules]) => {
    const fieldValue = fields[fieldName] || '';

    fieldRules.forEach(rule => {
      let isValid = true;

      switch (rule.type) {
        case 'required':
          isValid = validateRequired(fieldValue);
          break;
        case 'phone':
          isValid = fieldValue.trim() === '' || validatePhoneNumber(fieldValue);
          break;
        case 'email':
          isValid = fieldValue.trim() === '' || validateEmail(fieldValue);
          break;
        case 'minLength':
          isValid = fieldValue.trim() === '' || validateMinLength(fieldValue, rule.value || 0);
          break;
        case 'maxLength':
          isValid = validateMaxLength(fieldValue, rule.value || 1000);
          break;
        case 'telegramId':
          isValid = fieldValue.trim() === '' || validateTelegramId(fieldValue);
          break;
        case 'username':
          isValid = fieldValue.trim() === '' || validateUsername(fieldValue);
          break;
      }

      if (!isValid) {
        errors.push({
          field: fieldName,
          message: rule.message
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
