import { AppError } from '../utils/AppError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          'Authentication required before role verification.',
          401,
          'AUTHENTICATION_REQUIRED'
        )
      );
    }

    const hasRole = roles.some((role) => req.user.roles && req.user.roles.includes(role));

    if (!hasRole) {
      return next(
        new AppError(
          `Access forbidden. Requires one of the following roles: [${roles.join(', ')}].`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireProvider = requireRole('provider');
export const requireRequester = requireRole('requester');
