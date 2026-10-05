import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { SolveneraLogo } from '../components/layout/SolveneraLogo';

export const NotFoundPage = () => {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(224,122,95,0.08) 0%, transparent 65%)',
          filter: 'blur(60px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Logo mark */}
      <div className="relative z-10 animate-fade-up" style={{ animationDelay: '0s' }}>
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/22 flex items-center justify-center mb-6 shadow-xl mx-auto">
          <Compass className="w-10 h-10 text-rose-500" aria-hidden="true" />
        </div>

        {/* 404 */}
        <p
          className="text-[120px] sm:text-[160px] font-extrabold leading-none tracking-tighter mb-0"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--text-primary-rgb, 23,26,31), 0.15) 0%, rgba(var(--text-primary-rgb, 23,26,31), 0.06) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'var(--text-primary)',
            opacity: 0.2,
          }}
          aria-hidden="true"
        >
          404
        </p>

        {/* Overlay the "404" with styled version */}
        <div className="-mt-16 sm:-mt-20 mb-6">
          <h1 className="text-6xl sm:text-8xl font-extrabold text-[var(--text-primary)] tracking-tighter">
            4<span className="text-emerald-600 dark:text-emerald-400">0</span>4
          </h1>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3">
          Page Not Found
        </h2>
        <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link to="/" className="glass-btn-primary text-sm px-7 py-3 w-full sm:w-auto">
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="glass-btn-secondary text-sm px-7 py-3 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Branding */}
        <div className="mt-12 flex items-center justify-center gap-2 text-[var(--text-muted)] text-xs">
          <SolveneraLogo className="w-4 h-4" />
          <span>Solvenera — Turn your need into a practical solution</span>
        </div>
      </div>
    </div>
  );
};
