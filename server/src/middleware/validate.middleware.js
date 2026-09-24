import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(
      new AppError(
        formattedErrors[0]?.message || 'Validation failed',
        400,
        'VALIDATION_ERROR',
        formattedErrors
      )
    );
  };
};
