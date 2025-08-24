'use client';
import * as React from 'react';
import AuthForm from '../../_components/AuthForm';
import '../auth.css';

export default function SignInPage() {
  return (
    <AuthForm
      type="signin"
      title="Sign In"
      subtitle="Welcome back"
      submitButtonText="Sign In"
      loadingText="Signing In..."
    />
  );
}


