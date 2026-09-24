import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './authContextDef';
import { authApi } from '../api/authApi';
import {
  setInMemoryAccessToken,
  setupAuthCallbacks,
} from '../api/axiosInstance';
import toast from 'react-hot-toast';

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize in-memory token for Axios
  const handleSetAuth = useCallback((newUser, newAccessToken) => {
    setUser(newUser);
    setAccessToken(newAccessToken);
    setInMemoryAccessToken(newAccessToken);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setInMemoryAccessToken(null);
  }, []);

  // Register Axios callbacks for token refresh events
  useEffect(() => {
    setupAuthCallbacks({
      onRefreshed: ({ user: refreshedUser, accessToken: refreshedToken }) => {
        handleSetAuth(refreshedUser, refreshedToken);
      },
      onFailed: () => {
        clearAuth();
      },
    });
  }, [handleSetAuth, clearAuth]);

  // Initial silent session restoration on app startup
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const response = await authApi.refreshSession();
        if (isMounted && response?.success) {
          handleSetAuth(response.user, response.accessToken);
        }
      } catch {
        // Normal state when not logged in or cookie expired
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [handleSetAuth, clearAuth]);

  // Login handler
  const login = useCallback(
    async (credentials) => {
      try {
        const response = await authApi.login(credentials);
        if (response?.success) {
          handleSetAuth(response.user, response.accessToken);
          toast.success(`Welcome back, ${response.user.name}!`);
          return { success: true, user: response.user };
        }
        return { success: false, message: response?.message || 'Login failed' };
      } catch (error) {
        const message =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Invalid email or password';
        toast.error(message);
        return { success: false, message };
      }
    },
    [handleSetAuth]
  );

  // Register handler
  const register = useCallback(
    async (userData) => {
      try {
        const response = await authApi.register(userData);
        if (response?.success) {
          handleSetAuth(response.user, response.accessToken);
          toast.success('Account created successfully! Welcome aboard.');
          return { success: true, user: response.user };
        }
        return { success: false, message: response?.message || 'Registration failed' };
      } catch (error) {
        const message =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Registration failed. Please try again.';
        toast.error(message);
        return { success: false, message };
      }
    },
    [handleSetAuth]
  );

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API error:', error.message);
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
    }
  }, [clearAuth]);

  // Profile update handler
  const updateUser = useCallback(async (updateData) => {
    try {
      const response = await authApi.updateProfile(updateData);
      if (response?.success) {
        setUser(response.user);
        toast.success('Profile updated successfully');
        return { success: true, user: response.user };
      }
      return { success: false, message: response?.message };
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to update profile';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Change password handler
  const changePassword = useCallback(
    async (passwordData) => {
      try {
        const response = await authApi.changePassword(passwordData);
        if (response?.success) {
          toast.success('Password changed successfully. Please log in again.');
          clearAuth();
          return { success: true };
        }
        return { success: false, message: response?.message };
      } catch (error) {
        const message =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Failed to change password';
        toast.error(message);
        return { success: false, message };
      }
    },
    [clearAuth]
  );

  // Enable provider capability on same account (Additive role)
  const becomeProvider = useCallback(async () => {
    try {
      const response = await authApi.enableProviderCapability();
      if (response?.success) {
        setUser(response.user);
        toast.success('Provider capability unlocked on your account!');
        return { success: true, user: response.user };
      }
      return { success: false, message: response?.message };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || 'Failed to enable provider capability';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Computed role helpers
  const roles = useMemo(() => user?.roles || [], [user]);
  const isRequester = useMemo(() => roles.includes('requester'), [roles]);
  const isProvider = useMemo(() => roles.includes('provider'), [roles]);
  const isAdmin = useMemo(() => roles.includes('admin'), [roles]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      roles,
      isRequester,
      isProvider,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
      changePassword,
      becomeProvider,
    }),
    [
      user,
      accessToken,
      isLoading,
      roles,
      isRequester,
      isProvider,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
      changePassword,
      becomeProvider,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
