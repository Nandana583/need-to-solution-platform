import { AuthService } from '../services/auth.service.js';
import {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
} from '../utils/token.utils.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.register(
    req.body,
    req
  );

  // Set secure httpOnly cookie
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  return sendSuccess(res, 201, 'User registered successfully', {
    user,
    accessToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.login(
    req.body,
    req
  );

  // Set secure httpOnly cookie
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  return sendSuccess(res, 200, 'Login successful', {
    user,
    accessToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const tokenString =
    req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

  const { user, accessToken, refreshToken } = await AuthService.refreshSession(
    tokenString,
    req
  );

  // Set updated rotated httpOnly cookie
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  return sendSuccess(res, 200, 'Session refreshed successfully', {
    user,
    accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const tokenString = req.cookies?.[REFRESH_COOKIE_NAME];
  await AuthService.logout(tokenString);

  // Clear cookie
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...getRefreshCookieOptions(),
    maxAge: 0,
  });

  return sendSuccess(res, 200, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user._id);
  return sendSuccess(res, 200, 'Current user profile retrieved', { user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const updatedUser = await AuthService.updateProfile(req.user._id, req.body);
  return sendSuccess(res, 200, 'Profile updated successfully', {
    user: updatedUser,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await AuthService.changePassword(req.user._id, currentPassword, newPassword);

  // Clear cookie to enforce re-login with new password on next session
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...getRefreshCookieOptions(),
    maxAge: 0,
  });

  return sendSuccess(
    res,
    200,
    'Password changed successfully. Please log in with your new password.'
  );
});
