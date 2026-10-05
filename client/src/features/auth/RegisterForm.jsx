import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SolveneraLogo } from '../../components/layout/SolveneraLogo';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  ) : null;

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    const result = await registerUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setServerError(result.message || 'Registration failed. Please try again.');
    }
  };

  const inputClass = (hasError) =>
    `w-full pl-10 pr-4 py-2.5 glass-input ${
      hasError ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
    }`;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-black/10 dark:border-white/15 relative overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-emerald-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 mb-4 shadow-xl">
            <SolveneraLogo className="w-full h-full" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">
            Join the community solution network
          </p>

          {/* Unified Account Notice */}
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)]">
              <strong className="font-semibold text-emerald-700 dark:text-emerald-300">Unified Account:</strong>{' '}
              Request services now, and offer your own services or share resources anytime from your dashboard.
            </p>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{serverError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10" noValidate>
          {/* Name Field */}
          <div>
            <label
              htmlFor="reg-name"
              className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="reg-name"
                type="text"
                placeholder="Your full name"
                {...register('name')}
                className={inputClass(errors.name)}
                autoComplete="name"
              />
            </div>
            <FieldError message={errors.name?.message} />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className={inputClass(errors.email)}
                autoComplete="email"
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>

          {/* Phone Field (Optional) */}
          <div>
            <label
              htmlFor="reg-phone"
              className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
            >
              Phone{' '}
              <span className="text-[var(--text-muted)] lowercase font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
                className="w-full pl-10 pr-4 py-2.5 glass-input"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 #"
                  {...register('password')}
                  className={`w-full pl-10 pr-10 py-2.5 glass-input ${
                    errors.password ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reg-confirm"
                className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
              >
                Confirm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-10 py-2.5 glass-input ${
                    errors.confirmPassword ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError message={errors.confirmPassword?.message} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full glass-btn-primary py-3.5 text-base mt-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account…</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-black/8 dark:border-white/10 pt-5 relative z-10">
          <p className="text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
