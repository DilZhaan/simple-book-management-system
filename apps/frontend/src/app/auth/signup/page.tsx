'use client';
import * as React from 'react';
import AuthForm from '../../_components/AuthForm';
import '../../assets/auth.css';

export default function SignUpPage() {
  return (
    <AuthForm
      type="signup"
      title="Sign Up"
      subtitle="Create your account"
      submitButtonText="Create Account"
      loadingText="Creating Account..."
    />
  );
}
