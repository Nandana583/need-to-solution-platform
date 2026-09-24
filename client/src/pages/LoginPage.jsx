import React from 'react';
import { LoginForm } from '../features/auth/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
};
