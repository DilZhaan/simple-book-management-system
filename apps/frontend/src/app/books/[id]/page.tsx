'use client';
import React from 'react';
import { Container, Typography } from '@mui/material';

export default function BookDetail() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ color: 'white', textAlign: 'center' }}>
        Book Detail Page
      </Typography>
    </Container>
  );
}
