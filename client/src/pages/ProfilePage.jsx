import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import {
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  MapPin,
  Phone,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional(),
  locationLabel: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password confirmation does not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const ProfilePage = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      locationLabel: user?.locationLabel || '',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data) => {
    await updateUser(data);
  };

  const onPasswordSubmit = async (data) => {
    const res = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    if (res?.success) {
      resetPasswordForm();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Account Settings</h1>
        <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm mt-1">
          Manage your personal details, location preferences, and security credentials.
        </p>
      </div>

      {/* Account Info & Roles Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-mint-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-emerald-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{user?.name}</h2>
              <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {user?.isActive ? 'Account Active' : 'Account Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className="text-xs font-semibold text-[var(--text-muted)] dark:text-[var(--text-muted)] uppercase tracking-wider">
              Assigned Roles
            </span>
            <div className="flex gap-1.5">
              {user?.roles?.map((role) => (
                <span
                  key={role}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    role === 'admin'
                      ? 'bg-terracotta-500/20 text-terracotta-700 dark:text-terracotta-300 border border-terracotta-500/40'
                      : role === 'provider'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                      : 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40'
                  }`}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="mt-6 space-y-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                {...registerProfile('name')}
                className={`w-full px-4 py-2.5 glass-input ${
                  profileErrors.name ? 'border-rose-500' : ''
                }`}
              />
              {profileErrors.name && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{profileErrors.name.message}</p>
              )}
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Email Address <span className="text-charcoal-400 dark:text-[var(--text-muted)] lowercase">(read-only)</span>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 glass-input opacity-60 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...registerProfile('phone')}
                className="w-full px-4 py-2.5 glass-input"
              />
            </div>

            {/* Location Label */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                General Area / City
              </label>
              <input
                type="text"
                placeholder="e.g. Hyderabad, India"
                {...registerProfile('locationLabel')}
                className="w-full px-4 py-2.5 glass-input"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isProfileSubmitting}
              className="glass-btn-primary text-sm py-2 px-6"
            >
              {isProfileSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/15">
        <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-2">
          <KeyRound className="w-4 h-4 text-coral-600 dark:text-coral-400" />
          Change Password
        </h3>
        <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-6">
          For security, changing your password will revoke all other active refresh sessions on other devices.
        </p>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-xl">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...registerPassword('currentPassword')}
                className={`w-full px-4 pr-11 py-2.5 glass-input ${
                  passwordErrors.currentPassword ? 'border-rose-500' : ''
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-400 dark:text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-secondary)]"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {passwordErrors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                {...registerPassword('newPassword')}
                className={`w-full px-4 pr-11 py-2.5 glass-input ${
                  passwordErrors.newPassword ? 'border-rose-500' : ''
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-400 dark:text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-secondary)]"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                {...registerPassword('confirmPassword')}
                className={`w-full px-4 pr-11 py-2.5 glass-input ${
                  passwordErrors.confirmPassword ? 'border-rose-500' : ''
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-400 dark:text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-secondary)]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {passwordErrors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="glass-btn-primary text-sm py-2.5 px-6"
            >
              {isPasswordSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
