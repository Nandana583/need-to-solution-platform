import React from 'react';
import { LoginForm } from '../features/auth/LoginForm';

export const LoginPage = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 65%)',
          filter: 'blur(60px)',
          transform: 'translate(-50%, -30%)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-0 pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(224,122,95,0.06) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="relative z-10 w-full animate-fade-up">
        <LoginForm />
      </div>
    </div>
  );
};
