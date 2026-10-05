import React, { useEffect, useRef } from 'react';
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
  BookOpen,
  Search,
  Star,
  ChevronRight,
  MapPin,
  Clock,
  MessageSquare,
  Target,
  GitMerge,
  Handshake,
  Award,
} from 'lucide-react';
import { SolveneraLogo } from '../components/layout/SolveneraLogo';

/* ─── Sub-components ─── */

const JourneyStep = ({ number, label, description, accent }) => {
  const accents = {
    emerald: {
      bg: 'bg-emerald-500/12 dark:bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      num: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      hover: 'hover:border-emerald-500/40',
      glow: 'group-hover:shadow-[0_6px_20px_-6px_rgba(16,185,129,0.3)]',
    },
    teal: {
      bg: 'bg-teal-500/12 dark:bg-teal-500/10',
      border: 'border-teal-500/30',
      text: 'text-teal-700 dark:text-teal-300',
      num: 'bg-teal-500/20 text-teal-700 dark:text-teal-300',
      hover: 'hover:border-teal-500/40',
      glow: 'group-hover:shadow-[0_6px_20px_-6px_rgba(20,184,166,0.3)]',
    },
    mint: {
      bg: 'bg-mint-500/12 dark:bg-mint-500/10',
      border: 'border-mint-500/30',
      text: 'text-mint-700 dark:text-mint-300',
      num: 'bg-mint-500/20 text-mint-700 dark:text-mint-300',
      hover: 'hover:border-mint-500/40',
      glow: 'group-hover:shadow-[0_6px_20px_-6px_rgba(60,173,129,0.3)]',
    },
    coral: {
      bg: 'bg-coral-500/12 dark:bg-coral-500/10',
      border: 'border-coral-500/30',
      text: 'text-coral-700 dark:text-coral-300',
      num: 'bg-coral-500/20 text-coral-700 dark:text-coral-300',
      hover: 'hover:border-coral-500/40',
      glow: 'group-hover:shadow-[0_6px_20px_-6px_rgba(242,109,82,0.3)]',
    },
  };
  const c = accents[accent] || accents.emerald;

  return (
    <div className={`group flex flex-col items-center text-center gap-3.5 p-6 rounded-2xl ${c.bg} border ${c.border} ${c.hover} transition-all duration-300 ${c.glow}`}>
      <div className={`w-11 h-11 rounded-xl ${c.num} border ${c.border} flex items-center justify-center font-extrabold text-base tracking-tighter transition-transform duration-300 group-hover:scale-110`}>
        {number}
      </div>
      <h3 className={`text-sm font-bold ${c.text}`}>{label}</h3>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{description}</p>
    </div>
  );
};

const HowStep = ({ number, title, description, icon: Icon, accent }) => {
  const accents = {
    emerald: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', text: 'text-emerald-700 dark:text-emerald-300', numBg: 'bg-emerald-600', hover: 'hover:border-emerald-500/35' },
    teal:    { bg: 'bg-teal-500/15', border: 'border-teal-500/25', text: 'text-teal-700 dark:text-teal-300', numBg: 'bg-teal-600', hover: 'hover:border-teal-500/35' },
    mint:    { bg: 'bg-mint-500/15', border: 'border-mint-500/25', text: 'text-mint-700 dark:text-mint-300', numBg: 'bg-mint-600', hover: 'hover:border-mint-500/35' },
    amber:   { bg: 'bg-amber-500/15', border: 'border-amber-500/25', text: 'text-amber-700 dark:text-amber-300', numBg: 'bg-amber-600', hover: 'hover:border-amber-500/35' },
    coral:   { bg: 'bg-coral-500/15', border: 'border-coral-500/25', text: 'text-coral-700 dark:text-coral-300', numBg: 'bg-coral-600', hover: 'hover:border-coral-500/35' },
  };
  const c = accents[accent] || accents.emerald;

  return (
    <div className={`group flex flex-col p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border ${c.border} ${c.hover} transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-start gap-3 mb-4">
        <span className={`w-6 h-6 rounded-lg ${c.numBg} flex items-center justify-center font-extrabold text-xs text-white shrink-0 shadow-sm`}>
          {number}
        </span>
        <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{description}</p>
    </div>
  );
};

const FeaturePill = ({ icon: Icon, label, color }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color} border transition-all hover:scale-105`}>
    <Icon className="w-3.5 h-3.5" />
    {label}
  </span>
);

const ExploreCard = ({ icon: Icon, label, description, color, to, badge }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-500/12', border: 'border-emerald-500/25', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:border-emerald-500/40' },
    teal:    { bg: 'bg-teal-500/12', border: 'border-teal-500/25', text: 'text-teal-600 dark:text-teal-400', hover: 'hover:border-teal-500/40' },
    mint:    { bg: 'bg-mint-500/12', border: 'border-mint-500/25', text: 'text-mint-600 dark:text-mint-400', hover: 'hover:border-mint-500/40' },
    coral:   { bg: 'bg-coral-500/12', border: 'border-coral-500/25', text: 'text-coral-600 dark:text-coral-400', hover: 'hover:border-coral-500/40' },
  };
  const c = colors[color] || colors.emerald;

  return (
    <Link
      to={to}
      className={`glass-card-hover rounded-2xl p-6 border ${c.border} ${c.hover} flex flex-col group`}
    >
      <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mb-4 transition-transform group-hover:scale-105`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">{label}</h3>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed flex-1">{description}</p>
      <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold ${c.text} group-hover:gap-2.5 transition-all`}>
        {badge} <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
};

const TrustPillar = ({ icon: Icon, color, title, description }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-500/12', border: 'border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
    teal:    { bg: 'bg-teal-500/12', border: 'border-teal-500/20', text: 'text-teal-600 dark:text-teal-400' },
    amber:   { bg: 'bg-amber-500/12', border: 'border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
  };
  const c = colors[color] || colors.emerald;
  return (
    <div className="glass-card-hover rounded-2xl p-6 border border-black/5 dark:border-white/8">
      <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">{title}</h3>
      <p className="text-[var(--text-muted)] text-xs leading-relaxed">{description}</p>
    </div>
  );
};

/* ─── Main Page ─── */

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden pb-24 transition-colors duration-300">

      {/* ── Ambient Background Glows ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.05) 40%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        className="absolute bottom-1/3 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(224,122,95,0.06) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute top-1/3 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(20,184,166,0.05) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24 sm:space-y-32 pt-8">

        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <section className="text-center max-w-4xl mx-auto flex flex-col items-center pt-6">

          {/* Brand badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            Community Solution Platform
          </div>

          {/* Logo mark */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl mb-7 flex items-center justify-center animate-fade-up"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-xl), 0 0 0 8px rgba(16,185,129,0.04)',
              animationDelay: '0.05s',
            }}
          >
            <SolveneraLogo className="w-14 h-14 sm:w-16 sm:h-16" />
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4 leading-[1.04] animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 45%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SOLVENERA
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight max-w-2xl mx-auto leading-snug animate-fade-up"
            style={{ animationDelay: '0.15s' }}
          >
            Turn your need into a{' '}
            <span className="text-emerald-600 dark:text-emerald-400">practical solution.</span>
          </p>

          {/* Supporting copy */}
          <p
            className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            Find the right service, resource, or skilled person — and when the usual solution isn&apos;t
            available, discover relevant alternatives from the community.
          </p>

          {/* Feature pills */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 mt-6 animate-fade-up"
            style={{ animationDelay: '0.25s' }}
          >
            <FeaturePill icon={ShieldCheck} label="Verified Providers"    color="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25" />
            <FeaturePill icon={Users}      label="Community Resources"   color="bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25" />
            <FeaturePill icon={Zap}        label="Smart Matching"        color="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25" />
            <FeaturePill icon={MessageSquare} label="Structured Chat"    color="bg-coral-500/10 text-coral-700 dark:text-coral-300 border-coral-500/25" />
          </div>

          {/* CTA Buttons */}
          <div
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              to={isAuthenticated ? '/needs/new' : '/register'}
              className="glass-btn-primary px-9 py-4 text-sm shadow-xl w-full sm:w-auto"
            >
              <span>Post a Need</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/providers"
              className="glass-btn-secondary px-9 py-4 text-sm w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              <span>Explore Solutions</span>
            </Link>
          </div>

          {/* Visual stats row */}
          <div
            className="mt-12 w-full max-w-2xl mx-auto grid grid-cols-3 gap-4 animate-fade-up"
            style={{ animationDelay: '0.35s' }}
          >
            {[
              { label: 'Need-to-solution flow', value: '5-step' },
              { label: 'Provider availability', value: 'Real-time' },
              { label: 'Community fallback', value: 'Automatic' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-2xl"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            JOURNEY STEPS: NEED → MATCH → CONNECT → SOLVE
        ══════════════════════════════════════════ */}
        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-black/8 dark:border-white/10 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 65%)', filter: 'blur(40px)' }}
          />

          <div className="text-center max-w-xl mx-auto mb-10 relative z-10">
            <span className="section-label">The Solvenera Journey</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-2">
              Need → Match → Connect → Solve
            </h2>
            <p className="text-[var(--text-muted)] text-sm mt-2 leading-relaxed">
              A simple, transparent flow from your need to a real practical solution.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <JourneyStep number="01" label="State Your Need"   description="Describe your service, repair, tuition, or equipment need with timeline preferences." accent="amber" />
            <JourneyStep number="02" label="Smart Match"       description="Instant multi-factor scoring across verified providers and community peers." accent="teal" />
            <JourneyStep number="03" label="Direct Connect"    description="Request a booking or resource share with structured task-oriented coordination." accent="emerald" />
            <JourneyStep number="04" label="Practical Solve"   description="Completion tracking, structured review, and trusted community resolution." accent="coral" />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TWO PATHS: PRIMARY vs COMMUNITY
        ══════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

          {/* Primary Solution Card */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-500/25 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
            <div
              className="absolute top-0 right-0 w-52 h-52 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 65%)', filter: 'blur(35px)' }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="glass-badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  ✓ Primary Solution
                </span>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                Verified Providers &amp; Services
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                When standard commercial services are available, book verified technicians, repair specialists, and tutors directly.
              </p>
              <ul className="space-y-3.5">
                {[
                  'Transparent rates — fixed, hourly, or custom pricing',
                  'Live availability: Available Now, Busy, Weekends Only',
                  'Service-specific ratings independent from overall score',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/providers"
                className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:gap-3 transition-all"
              >
                Browse Providers <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Community Fallback Card */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-coral-500/25 relative overflow-hidden group hover:border-coral-500/40 transition-all duration-300">
            <div
              className="absolute top-0 right-0 w-52 h-52 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(242,109,82,0.1) 0%, transparent 65%)', filter: 'blur(35px)' }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="glass-badge bg-coral-500/15 text-coral-700 dark:text-coral-300 border border-coral-500/25">
                  ↺ Community Alternative
                </span>
                <div className="w-11 h-11 rounded-xl bg-coral-500/15 border border-coral-500/25 flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-coral-600 dark:text-coral-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                Can&apos;t find the usual solution?
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                When standard providers are unavailable, Solvenera discovers peers lending books, notes, tools, or equipment nearby.
              </p>
              <ul className="space-y-3.5">
                {[
                  'Discover peers lending course books, notes, lab tools',
                  'Automatic fallback when commercial providers are unavailable',
                  'Single unified account — request and share resources freely',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
                    <CheckCircle2 className="w-4 h-4 text-coral-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/resources"
                className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-coral-600 dark:text-coral-400 hover:gap-3 transition-all"
              >
                Explore Resources <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            HOW SOLVENERA WORKS
        ══════════════════════════════════════════ */}
        <section className="glass-card rounded-3xl p-8 sm:p-14 border border-black/8 dark:border-white/10 relative overflow-hidden">
          <div
            className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 65%)', filter: 'blur(50px)' }}
          />
          <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
            <span className="section-label">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-2">
              From Request to Completion in 5 Steps
            </h2>
            <p className="text-[var(--text-muted)] text-sm mt-2 leading-relaxed">
              A transparent, calm, and structured workflow for solving real requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            <HowStep number="1" title="Tell us what you need"          description="Post your service, tuition, or equipment need with timeline and location preferences." icon={Target}      accent="emerald" />
            <HowStep number="2" title="Find suitable solutions"        description="The system matches verified providers first, then discovers community alternatives."  icon={Search}      accent="teal" />
            <HowStep number="3" title="Connect with the right person"  description="View authentic profiles, service areas, availability status and request directly."    icon={Handshake}   accent="mint" />
            <HowStep number="4" title="Complete the request"           description="Track timelines, confirm fulfillment, and coordinate via real task communication."     icon={Clock}       accent="amber" />
            <HowStep number="5" title="Share your experience"          description="Leave constructive ratings and feedback with required reasons to help the community."  icon={Star}        accent="coral" />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            EXPLORE WHAT YOU CAN DO
        ══════════════════════════════════════════ */}
        <section>
          <div className="text-center mb-10">
            <span className="section-label">Explore What You Can Do</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-2">
              Find the right solution for your need
            </h2>
            <p className="text-[var(--text-muted)] text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              Whether you need a service, want to borrow resources, or are ready to offer help — Solvenera connects you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ExploreCard icon={Wrench}   label="Services"   description="Repair specialists, electricians, plumbers, and skilled technicians." color="emerald" to="/providers" badge="Book Now" />
            <ExploreCard icon={BookOpen} label="Resources"  description="Borrow or share course books, notes, lab tools, and study materials."  color="teal"    to="/resources" badge="Browse" />
            <ExploreCard icon={Users}    label="Providers"  description="Skilled people offering services like tutoring, repair, and more."    color="mint"    to="/providers" badge="Explore" />
            <ExploreCard icon={Repeat}   label="Community"  description="Peers sharing and requesting resources in your local area."           color="coral"   to="/resources" badge="Discover" />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TRUST PILLARS
        ══════════════════════════════════════════ */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <TrustPillar icon={Users}      color="emerald" title="Single Unified Account"   description="Post needs as a requester, and unlock provider capability or share books anytime with zero duplicate accounts." />
          <TrustPillar icon={ShieldCheck} color="teal"   title="Protected &amp; Secure"  description="In-memory JWT access tokens with secure httpOnly cookie session rotation and strict role enforcement." />
          <TrustPillar icon={Zap}        color="amber"   title="Transparent Matching"    description="Multi-factor scoring considering category, location, availability, and urgency — no black box algorithms." />
        </section>

        {/* ══════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════ */}
        <section className="glass-card rounded-3xl p-12 sm:p-16 border border-emerald-500/20 relative overflow-hidden text-center">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(20,184,166,0.04) 40%, rgba(224,122,95,0.04) 80%, transparent 100%)',
          }} />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
          />
          <div className="relative z-10">
            <span className="section-label">Ready to get started?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mt-3 mb-4 tracking-tight">
              Your solution is one step away
            </h2>
            <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto leading-relaxed mb-10">
              Join Solvenera and connect with verified service providers and community resources that can solve your everyday needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? '/needs/new' : '/register'}
                className="glass-btn-primary px-10 py-4 text-base shadow-xl"
              >
                <span>{isAuthenticated ? 'Post a Need' : 'Get Started Free'}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/providers"
                className="glass-btn-secondary px-10 py-4 text-base"
              >
                <Search className="w-5 h-5" />
                <span>Browse Providers</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
