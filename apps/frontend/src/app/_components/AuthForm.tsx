'use client';
import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Alert
} from '@mui/material';
import { useAuth } from '../_context/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  type: 'signin' | 'signup';
  title: string;
  subtitle: string;
  submitButtonText: string;
  loadingText: string;
}

export default function AuthForm({ 
  type, 
  title, 
  subtitle, 
  submitButtonText, 
  loadingText 
}: AuthFormProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:3000/graphql';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    
    if (type === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const query = type === 'signin' 
        ? `
          mutation Login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
              token
              user {
                id
                username
              }
            }
          }
        `
        : `
          mutation Register($username: String!, $password: String!) {
            register(username: $username, password: $password) {
              token
              user {
                id
                username
              }
            }
          }
        `;

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            username,
            password
          }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        setError(data.errors[0].message);
      } else {
        const result = type === 'signin' ? data.data.login : data.data.register;
        const { token, user } = result;
        login(token, user);
        router.push('/');
      }
    } catch (err) {
      setError(`Failed to ${type === 'signin' ? 'sign in' : 'sign up'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box className="auth-container">
        <Card className="auth-card">
          <CardContent className="auth-card-content">
            <Typography component="h1" variant="h4" className="auth-title">
              {title}
            </Typography>
            <Typography variant="body2" className="auth-subtitle">
              {subtitle}
            </Typography>
            
            {error && (
              <Alert severity="error" className="auth-error">
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="auth-form">
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-textfield"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete={type === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-textfield"
              />
              {type === 'signup' && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-textfield"
                />
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="auth-submit-button"
              >
                {loading ? loadingText : submitButtonText}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
