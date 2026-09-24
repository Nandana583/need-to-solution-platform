import { verifyAccessToken } from '../utils/token.utils.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'Authentication required. Please provide a valid access token.',
        401,
        'AUTHENTICATION_REQUIRED'
      )
    );
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError(
          'Access token has expired. Please refresh your session.',
          401,
          'TOKEN_EXPIRED'
        )
      );
    }
    return next(
      new AppError(
        'Invalid access token. Authentication failed.',
        401,
        'INVALID_TOKEN'
      )
    );
  }

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exists.',
        401,
        'USER_NOT_FOUND'
      )
    );
  }

  if (!currentUser.isActive) {
    return next(
      new AppError(
        'Your account has been deactivated. Please contact support.',
        403,
        'ACCOUNT_DEACTIVATED'
      )
    );
  }

  // Attach verified user to request
  req.user = currentUser;
  next();
});
