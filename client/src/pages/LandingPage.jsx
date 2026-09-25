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
    <div className="relative overflow-hidden pt-6 pb-24">
      {/* Background Decorative Subtle Ambient Radial Highlights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/10 via-emerald-500/10 to-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto pt-4 pb-4 flex flex-col items-center">
          {/* Prominent Official Logo Asset */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/5 border border-white/15 p-3.5 mb-6 backdrop-blur-xl shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all duration-300">
            <img
              src="/logo.png"
              alt="Solvenera logo"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          {/* Solvenera Title */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              SOLVENERA
            </span>
          </h1>

          <p className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight max-w-2xl mx-auto">
            Turn your need into a practical solution.
          </p>

          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Find the right service, resource, or skilled person — and when the usual solution isn&apos;t available, discover relevant alternatives from the community.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              to={isAuthenticated ? "/needs/new" : "/register"}
              className="glass-btn-primary px-8 py-3.5 text-base shadow-xl w-full sm:w-auto"
            >
              <span>Post a Need</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/providers"
              className="glass-btn-secondary px-8 py-3.5 text-base w-full sm:w-auto"
            >
              <span>Explore Solutions</span>
            </Link>
          </div>
        </div>

        {/* 5-Step Solution Flow Section */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/15 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              From Request to Completion in 5 Steps
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              A transparent, calm, and structured workflow for solving real requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center mb-3">
                  1
                </span>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  Tell us what you need
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Post your service repair, tuition, study material, or equipment need with timeline preferences.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-bold flex items-center justify-center mb-3">
                  2
                </span>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  We find suitable solutions
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The system matches verified providers first and discovers community alternatives if none are available.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center mb-3">
                  3
                </span>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  Connect with the right person
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  View authentic profile details, service areas, availability status, and request directly.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center mb-3">
                  4
                </span>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  Complete the request
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track schedule timelines, confirm fulfillment, and manage updates from your dashboard.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center mb-3">
                  5
                </span>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  Share your experience
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Leave constructive ratings and feedback with required reasons to help the entire community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fallback & Community Resource Explanation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Phase 1 Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="glass-badge bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Primary Phase
              </span>
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verified Providers & Services</h3>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              When standard commercial services are available, you can book verified technicians, repair specialists, and tutors directly.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Transparent rates with fixed, hourly, or custom options</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Live availability status: Available Now, Busy, or Weekends Only</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Service-specific ratings independent from overall user score</span>
              </li>
            </ul>
          </div>

          {/* Fallback Phase Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="glass-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Community Fallback
              </span>
              <Repeat className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Can&apos;t find the usual solution?</h3>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              The platform can look for relevant community resources and people who have actually listed the required skill, textbook, or tool.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Discover peers lending course books, notes, and lab tools</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic fallback activated when commercial providers are unavailable</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Single unified account lets you request and share resources freely</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Calm Trust Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card-hover rounded-2xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Single Unified Account</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Post needs as a requester, and unlock provider capability or share books anytime with zero duplicate accounts.
            </p>
          </div>

          <div className="glass-card-hover rounded-2xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Protected & Secure</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              In-memory JWT access tokens with secure httpOnly cookie session rotation and strict role enforcement.
            </p>
          </div>

          <div className="glass-card-hover rounded-2xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Transparent Matching</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Multi-factor scoring considering category compatibility, location area, availability, and urgency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
