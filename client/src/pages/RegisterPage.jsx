import React from 'react';
import { RegisterForm } from '../features/auth/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/4 pointer-events-none"
        style={{
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 pointer-events-none"
        style={{
          width: '500px', height: '350px',
          background: 'radial-gradient(ellipse, rgba(20,184,166,0.06) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="relative z-10 w-full animate-fade-up">
        <RegisterForm />
      </div>
    </div>
  );
};
