import React from 'react';
import { RegisterForm } from '../features/auth/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  );
};
