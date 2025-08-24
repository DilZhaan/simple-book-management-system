'use client';
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MenuBook as BookIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../_context/AuthContext';
import { createBook } from '../bookApi';
import BookForm, { BookFormData, BookFormErrors } from '../../_components/BookForm';
import '../../assets/books.css';

export default function AddBook() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    publishedYear: new Date().getFullYear(),
    genre: ''
  });

  const [formErrors, setFormErrors] = useState<BookFormErrors>({});



  React.useEffect(() => {
    if (!isSignedIn) {
      router.push('/auth/signin');
    }
  }, [isSignedIn, router]);



  const handleInputChange = (field: keyof BookFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    

    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  

  const validateForm = (): boolean => {
    const errors: BookFormErrors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.author.trim()) {
      errors.author = 'Author is required';
    }
    
    if (!formData.genre.trim()) {
      errors.genre = 'Genre is required';
    }
    
    if (formData.publishedYear < 1 || formData.publishedYear > new Date().getFullYear() + 1) {
      errors.publishedYear = 'Please enter a valid published year';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newBook = await createBook(formData);
      setSuccess(true);
      
      

      setTimeout(() => {
        router.push(`/books/${newBook.id}`);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  if (success) {
    return (
      <Container maxWidth="md" className="book-container">
        <Box className="book-form-container" sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" className="book-title" sx={{ mb: 2 }}>
            Book Added Successfully!
          </Typography>
          <Typography variant="body1" className="book-description" sx={{ mb: 3 }}>
            Redirecting to book details...
          </Typography>
          <CircularProgress sx={{ color: 'rgba(138, 43, 226, 0.8)' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="book-container">


      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/books')}
          className="book-btn-secondary"
        >
          Back to Books
        </Button>
      </Box>



      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" className="book-title" sx={{ mb: 2 }}>
          <BookIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Add New Book
        </Typography>
        <Typography variant="h6" className="book-description">
          Add a new book to the library collection
        </Typography>
      </Box>



      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}



      <BookForm
        formData={formData}
        formErrors={formErrors}
        loading={loading}
        isEditing={false}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/books')}
      />



      <Card className="book-card" sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" className="book-title" sx={{ mb: 2 }}>
            Tips for Adding Books
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" className="book-description">
              • Make sure the title is accurate and complete
            </Typography>
            <Typography variant="body2" className="book-description">
              • Include the full author name (First Last or Last, First)
            </Typography>
            <Typography variant="body2" className="book-description">
              • Use the original publication year, not reprint dates
            </Typography>
            <Typography variant="body2" className="book-description">
              • Choose the most appropriate genre from the list
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
