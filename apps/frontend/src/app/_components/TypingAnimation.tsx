// Copied from dilzhan.com

'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import '../assets/TypingAnimation.css';

interface TypingAnimationProps {
  phrases?: string[];
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  phrases = [
    "Book Management System",
    "Digital Library Platform",
    "Reading Companion",
    "Knowledge Repository"
  ]
}) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(true);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    let timer: NodeJS.Timeout;

    if (isTyping) {
      // Typing effect
      if (displayText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        }, 100);
      } else {
        // Pause before erasing
        timer = setTimeout(() => {
          setIsTyping(false);
        }, 1500);
      }
    } else {
      // Erasing effect
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, 50);
      } else {
        // Move to next phrase
        const nextIndex = (phraseIndex + 1) % phrases.length;
        setPhraseIndex(nextIndex);
        setIsTyping(true);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [displayText, phraseIndex, isTyping, phrases]);

  return (
    <Box className="typing-animation-container">
      <Typography
        variant="h3"
        component="span"
        className="typing-animation-text"
      >
        {displayText}
        <Box
          component="span"
          className="typing-animation-cursor"
        />
      </Typography>
    </Box>
  );
};

export default TypingAnimation;
