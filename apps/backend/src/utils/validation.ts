import Joi from 'joi';
import { USER_ROLES } from '../config/auth';

// User registration validation
export const registerValidation = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be less than 30 characters',
      'any.required': 'Username is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must be less than 128 characters',
      'any.required': 'Password is required',
    }),
  firstName: Joi.string()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'First name must be less than 50 characters',
    }),
  lastName: Joi.string()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Last name must be less than 50 characters',
    }),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .optional()
    .default(USER_ROLES.USER),
});

// User login validation
export const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// User update validation
export const updateUserValidation = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .optional()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be less than 30 characters',
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  firstName: Joi.string()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'First name must be less than 50 characters',
    }),
  lastName: Joi.string()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Last name must be less than 50 characters',
    }),
  isActive: Joi.boolean().optional(),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .optional(),
});

// Password change validation
export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password must be less than 128 characters',
      'any.required': 'New password is required',
    }),
});

// Validation helper function
export const validateInput = <T>(schema: Joi.ObjectSchema<T>, data: unknown): T => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new Error(`Validation error: ${errorMessages.join(', ')}`);
  }

  return value;
};