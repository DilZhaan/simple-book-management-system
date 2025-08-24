'use client';
import React, { useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip
} from '@mui/material';
import {
  ContactMail as ContactIcon,
  MenuBook as BookIcon,
  LibraryBooks as LibraryIcon,
  AutoStories as StoriesIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import TypingAnimation from './_components/TypingAnimation';
import './assets/homepage.css';

export default function HomePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  
  //i use my portfolio website as a ref to create this home page


  return (
    <Box
      component="section"
      className="homepage-section"
    >
      {/* Animated background elements */}
      <Box className="homepage-bg-effect-1" />
      <Box className="homepage-bg-effect-2" />

      <Container maxWidth="lg" className="homepage-container">
        <Box
          ref={containerRef}
          className="homepage-content"
        >
          {/* Welcome Section */}
          <Stack className="homepage-stack">
            <Box className="homepage-icons">
              <BookIcon className="homepage-icon-book" />
              <LibraryIcon className="homepage-icon-library" />
              <StoriesIcon className="homepage-icon-stories" />
            </Box>

            <Typography
              variant="h1"
              component="h1"
              className="homepage-title"
            >
              Welcome to BookVault
            </Typography>

            <Box className="homepage-typing-container">
              <TypingAnimation />
            </Box>

            {/* Feature Chips */}
            <Stack className="homepage-chips">
              <Chip 
                label="Search Books" 
                variant="outlined" 
                color="primary"
                className="homepage-chip primary"
              />
              <Chip 
                label="Add New Books" 
                variant="outlined" 
                color="secondary"
                className="homepage-chip secondary"
              />
              <Chip 
                label="Update New Books" 
                variant="outlined" 
                color="primary"
                className="homepage-chip primary"
              />
              <Chip 
                label="Remove Book(s)" 
                variant="outlined" 
                color="primary"
                className="homepage-chip primary"
              />
            </Stack>

            {/* Action Buttons */}
            <Stack className="homepage-buttons">
              <Button
                variant="contained"
                size="large"
                startIcon={<LibraryIcon />}
                onClick={() => router.push('/books')}
                className="homepage-button primary"
              >
                Explore Books
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<ContactIcon />}
                onClick={() => router.push('/auth/signin')}
                className="homepage-button outlined"
              >
                Get Started
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>

      {/* Bottom gradient divider */}
      <Box className="homepage-bottom-divider" />
    </Box>
  );
}
