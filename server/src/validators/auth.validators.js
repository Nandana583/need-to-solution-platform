import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('phone')
    .optional()
    .trim(),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
      if (value && value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  // Explicitly disallow roles or admin payload in registration body
  body('roles').custom((value) => {
    if (value !== undefined) {
      throw new Error('Roles cannot be assigned during standard registration');
    }
    return true;
  }),
  body('isAdmin').custom((value) => {
    if (value !== undefined) {
      throw new Error('Admin status cannot be self-assigned');
    }
    return true;
  }),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim(),
  body('profileImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
  body('locationLabel')
    .optional()
    .trim(),
  body('location')
    .optional()
    .custom((val) => {
      if (typeof val === 'object' && val !== null) {
        return true;
      }
      throw new Error('Location must be a valid GeoJSON object');
    }),
  // Prevent unauthorized modification of protected fields
  body('roles').custom((value) => {
    if (value !== undefined) {
      throw new Error('Modifying roles directly via this endpoint is not permitted');
    }
    return true;
  }),
  body('email').custom((value) => {
    if (value !== undefined) {
      throw new Error('Email changes must be performed through the dedicated email verification flow');
    }
    return true;
  }),
  body('isActive').custom((value) => {
    if (value !== undefined) {
      throw new Error('Cannot modify account status');
    }
    return true;
  }),
  body('isVerified').custom((value) => {
    if (value !== undefined) {
      throw new Error('Cannot modify verification status directly');
    }
    return true;
  }),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number')
    .custom((val, { req }) => {
      if (val === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New password confirmation does not match');
      }
      return true;
    }),
];
