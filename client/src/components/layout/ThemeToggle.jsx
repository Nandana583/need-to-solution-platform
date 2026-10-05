import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle — Premium dark/light mode switcher
 * Smooth icon transition with subtle scale animation.
 */
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="theme-toggle-btn"
      className={`relative p-2 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
        bg-black/5 dark:bg-white/5
        hover:bg-black/10 dark:hover:bg-white/10
        border border-black/10 dark:border-white/10
        hover:border-black/16 dark:hover:border-white/16
        text-[var(--text-muted)]
        hover:text-emerald-600 dark:hover:text-emerald-400
        ${className}`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={!isDark}
    >
      <span className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {/* Sun — visible in dark mode */}
        <Sun
          className={`w-4 h-4 absolute transition-all duration-300 ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-50'
          }`}
          aria-hidden="true"
        />
        {/* Moon — visible in light mode */}
        <Moon
          className={`w-4 h-4 absolute transition-all duration-300 ${
            !isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-50'
          }`}
          aria-hidden="true"
        />
      </span>
    </button>
  );
};
