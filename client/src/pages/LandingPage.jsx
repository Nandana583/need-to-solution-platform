import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Repeat,
  CheckCircle2,
  Wrench,
  Zap,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-8 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-300 text-xs font-semibold mb-6 backdrop-blur-md animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            Two-Phase Need-to-Solution Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            From Everyday Needs to{' '}
            <span className="bg-gradient-to-r from-primary-400 via-accent-500 to-indigo-300 bg-clip-text text-transparent">
              Real-World Solutions
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Solve any need by checking verified commercial options first — and automatically fallback to practical community alternatives when standard channels are unavailable.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="glass-btn-primary px-8 py-4 text-base shadow-xl w-full sm:w-auto">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="glass-btn-primary px-8 py-4 text-base shadow-xl w-full sm:w-auto">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="glass-btn-secondary px-8 py-4 text-base w-full sm:w-auto">
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* The 2-Phase Decision Flow Visual */}
        <div className="mt-12 glass-card rounded-3xl p-8 sm:p-12 border border-white/15 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
              Core Product Principle
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Intelligent Fallback Architecture
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              How our system ensures you always find a practical solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {/* Phase 1 Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-primary-500/30 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="glass-badge bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  Phase 1: Primary
                </span>
                <Wrench className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Commercial & Professional Options</h3>
              <p className="text-slate-300 text-sm mb-4">
                Searches registered professionals, verified service shops, and standard commercial suppliers nearby.
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Checks real-time provider availability & operating schedule
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Geo-spatial distance scoring & delivery deadlines
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Direct booking & service request tracking
                </li>
              </ul>
            </div>

            {/* Phase 2 Card (Fallback) */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-accent-500/30 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="glass-badge bg-accent-500/20 text-pink-300 border border-accent-500/30">
                  Phase 2: Fallback
                </span>
                <Repeat className="w-6 h-6 text-accent-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Community Alternatives</h3>
              <p className="text-slate-300 text-sm mb-4">
                When commercial options are unavailable, too distant, or outside deadlines, system searches community assets.
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400" />
                  Finds users who own matching textbooks or tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400" />
                  Shared book pages, photos, and study notes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400" />
                  Borrowing, lending, and peer resource-sharing
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-hover rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Unified Account</h3>
            <p className="text-slate-400 text-sm">
              One account for everything. Post needs as a requester and offer services or share books as a provider without separate logins.
            </p>
          </div>

          <div className="glass-card-hover rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure JWT Auth</h3>
            <p className="text-slate-400 text-sm">
              Stateless in-memory access tokens with automatic silent refresh via secure httpOnly cookies.
            </p>
          </div>

          <div className="glass-card-hover rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Matching Ready</h3>
            <p className="text-slate-400 text-sm">
              Engineered with multi-factor scoring for category, distance, availability, and resource compatibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
