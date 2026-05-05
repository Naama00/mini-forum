import { REGEX } from './constants';

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return REGEX.EMAIL.test(email);
};

/**
 * Validate password
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate URL
 * @param {string} url
 * @returns {boolean}
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate article form
 * @param {object} form
 * @returns {object} errors
 */
export const validateArticleForm = (form) => {
  const errors = {};

  if (!form.title || form.title.trim().length < 3) {
    errors.title = 'כותרת חייבת להיות לפחות 3 תווים';
  }

  if (!form.summary || form.summary.trim().length < 10) {
    errors.summary = 'סיכום חייב להיות לפחות 10 תווים';
  }

  if (!form.content || form.content.trim().length < 20) {
    errors.content = 'תוכן חייב להיות לפחות 20 תווים';
  }

  if (form.image && !isValidURL(form.image)) {
    errors.image = 'כתובת התמונה אינה תקינה';
  }

  return errors;
};

/**
 * Validate login form
 * @param {object} form
 * @returns {object} errors
 */
export const validateLoginForm = (form) => {
  const errors = {};

  if (!form.email) {
    errors.email = 'דוא"ל הוא שדה חובה';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'דוא"ל אינו תקין';
  }

  if (!form.password) {
    errors.password = 'סיסמה היא שדה חובה';
  } else if (!isValidPassword(form.password)) {
    errors.password = 'סיסמה חייבת להיות לפחות 6 תווים';
  }

  return errors;
};

/**
 * Validate register form
 * @param {object} form
 * @returns {object} errors
 */
export const validateRegisterForm = (form) => {
  const errors = {};

  if (!form.firstName || form.firstName.trim().length < 2) {
    errors.firstName = 'שם פרטי חייב להיות לפחות 2 תווים';
  }

  if (!form.lastName || form.lastName.trim().length < 2) {
    errors.lastName = 'שם משפחה חייב להיות לפחות 2 תווים';
  }

  if (!form.email) {
    errors.email = 'דוא"ל הוא שדה חובה';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'דוא"ל אינו תקין';
  }

  if (!form.password) {
    errors.password = 'סיסמה היא שדה חובה';
  } else if (!isValidPassword(form.password)) {
    errors.password = 'סיסמה חייבת להיות לפחות 6 תווים';
  }

  return errors;
};

/**
 * Validate post form
 * @param {object} form
 * @returns {object} errors
 */
export const validatePostForm = (form) => {
  const errors = {};

  if (!form.content || form.content.trim().length < 3) {
    errors.content = 'תוכן הפוסט חייב להיות לפחות 3 תווים';
  }

  return errors;
};

export default {
  isValidEmail,
  isValidPassword,
  isValidURL,
  validateArticleForm,
  validateLoginForm,
  validateRegisterForm,
  validatePostForm,
};
