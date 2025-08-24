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
import { useAuth } from '../../_context/AuthContext';
import { useRouter } from 'next/navigation';
import '../auth.css';

export default function SignUpPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Register($username: String!, $password: String!) {
              register(username: $username, password: $password) {
                token
                user {
                  id
                  username
                }
              }
            } `,
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
        const { token, user } = data.data.register;
        login(token, user);
        router.push('/');
      }
    } catch (err) {
      setError('Failed to sign up. Please try again.');
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
              Sign Up
            </Typography>
            <Typography variant="body2" className="auth-subtitle">
              Create your account
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-textfield"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="auth-submit-button"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
