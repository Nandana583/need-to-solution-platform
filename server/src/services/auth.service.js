import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { AppError } from '../utils/AppError.js';
import {
  generateAccessToken,
  createAndSaveRefreshToken,
  verifyRefreshToken,
} from '../utils/token.utils.js';
import { config } from '../config/env.js';

export class AuthService {
  /**
   * Register a new user with default 'requester' role
   */
  static async register({ name, email, password, phone }, req) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError(
        'An account with this email address already exists.',
        409,
        'DUPLICATE_EMAIL'
      );
    }

    // 12 salt rounds per architectural specification
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone ? phone.trim() : '',
      roles: ['requester'], // Enforce single initial role
      isActive: true,
      isVerified: false,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = await createAndSaveRefreshToken(newUser, req);

    return {
      user: newUser.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate user with email and password
   */
  static async login({ email, password }, req) {
    const normalizedEmail = email.toLowerCase().trim();

    // Select passwordHash explicitly since it is excluded by default
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      throw new AppError(
        'Invalid email or password.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    if (!user.isActive) {
      throw new AppError(
        'Your account has been deactivated. Please contact support.',
        403,
        'ACCOUNT_DEACTIVATED'
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError(
        'Invalid email or password.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await createAndSaveRefreshToken(user, req);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate refresh token and issue new access token
   */
  static async refreshSession(tokenString, req) {
    if (!tokenString) {
      throw new AppError(
        'Refresh token missing. Please log in again.',
        401,
        'REFRESH_TOKEN_MISSING'
      );
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(tokenString);
    } catch (error) {
      throw new AppError(
        'Invalid or expired refresh token. Please log in again.',
        401,
        'INVALID_REFRESH_TOKEN'
      );
    }

    // Find token in database
    const tokenRecord = await RefreshToken.findOne({ token: tokenString });

    if (!tokenRecord) {
      throw new AppError(
        'Refresh token not recognized or already used.',
        401,
        'TOKEN_NOT_FOUND'
      );
    }

    // Fraud detection: If token was already revoked, someone is reusing it
    if (tokenRecord.isRevoked) {
      // Invalidate all tokens for this user as a safeguard
      await RefreshToken.updateMany(
        { userId: tokenRecord.userId },
        { isRevoked: true }
      );
      throw new AppError(
        'Security alert: Refresh token reuse detected. All sessions invalidated.',
        401,
        'TOKEN_REUSE_DETECTED'
      );
    }

    // Check expiration date
    if (new Date() > tokenRecord.expiresAt) {
      tokenRecord.isRevoked = true;
      await tokenRecord.save();
      throw new AppError(
        'Refresh token has expired. Please log in again.',
        401,
        'REFRESH_TOKEN_EXPIRED'
      );
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new AppError(
        'User associated with this session no longer exists or is inactive.',
        401,
        'USER_INACTIVE'
      );
    }

    // Token Rotation: Invalidate current token and generate new one
    tokenRecord.isRevoked = true;
    await tokenRecord.save();

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await createAndSaveRefreshToken(user, req);

    // Link previous token to replacement for audit trail
    tokenRecord.replacedByToken = newRefreshToken;
    await tokenRecord.save();

    return {
      user: user.toSafeObject(),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke session refresh token
   */
  static async logout(tokenString) {
    if (tokenString) {
      await RefreshToken.findOneAndUpdate(
        { token: tokenString },
        { isRevoked: true }
      );
    }
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }
    return user.toSafeObject();
  }

  /**
   * Update allowed profile fields (whitelist protected)
   */
  static async updateProfile(userId, updateFields) {
    const allowedUpdates = {};
    const whitelist = ['name', 'phone', 'profileImage', 'locationLabel', 'location'];

    for (const key of whitelist) {
      if (updateFields[key] !== undefined) {
        allowedUpdates[key] = updateFields[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    return updatedUser.toSafeObject();
  }

  /**
   * Change user password and revoke all active sessions
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError(
        'Current password is incorrect.',
        400,
        'INCORRECT_CURRENT_PASSWORD'
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newPasswordHash;
    await user.save();

    // Revoke all refresh tokens for this user
    await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true }
    );

    return true;
  }

  /**
   * Seed admin user if it does not exist
   */
  static async seedAdmin() {
    try {
      const adminEmail = config.adminSeed.email.toLowerCase().trim();
      const existingAdmin = await User.findOne({ email: adminEmail });

      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(config.adminSeed.password, 12);
        await User.create({
          name: 'System Administrator',
          email: adminEmail,
          passwordHash,
          roles: ['requester', 'provider', 'admin'],
          isActive: true,
          isVerified: true,
          locationLabel: 'Headquarters',
        });
        console.log(`[Admin Seed] Admin account initialized: ${adminEmail}`);
      } else if (!existingAdmin.roles.includes('admin')) {
        existingAdmin.roles.push('admin');
        await existingAdmin.save();
        console.log(`[Admin Seed] Admin role attached to existing account: ${adminEmail}`);
      }
    } catch (err) {
      console.error('[Admin Seed Error]:', err.message);
    }
  }
}
