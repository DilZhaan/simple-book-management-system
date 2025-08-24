'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../_context/AuthContext';
import { getBook, updateBook, Book } from '../../bookApi';
import BookForm, { BookFormData, BookFormErrors } from '../../../_components/BookForm';
import '../../../assets/books.css';

export default function EditBook() {
  const router = useRouter();
  const params = useParams();
  const { isSignedIn, user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const bookId = params.id as string;
  
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    publishedYear: new Date().getFullYear(),
    genre: ''
  });

  const [formErrors, setFormErrors] = useState<BookFormErrors>({});


  

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const bookData = await getBook(bookId);
        
        if (bookData) {
          setBook(bookData);
          setFormData({
            title: bookData.title,
            author: bookData.author,
            publishedYear: bookData.publishedYear,
            genre: bookData.genre
          });
        } else {
          setError('Book not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      loadBook();
    }
  }, [bookId]);


  

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/auth/signin');
      return;
    }
    
    if (book && user && user.id !== book.createdBy.id) {
      router.push(`/books/${book.id}`);
    }
  }, [isSignedIn, book, user, router]);


  

  const handleInputChange = (field: keyof BookFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    

    

    if (formErrors[field as keyof BookFormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };


  

  const validateForm = (): boolean => {
    const errors: BookFormErrors = {};
    
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.author?.trim()) {
      errors.author = 'Author is required';
    }
    
    if (!formData.genre?.trim()) {
      errors.genre = 'Genre is required';
    }
    
    if (formData.publishedYear && (formData.publishedYear < 1 || formData.publishedYear > new Date().getFullYear() + 1)) {
      errors.publishedYear = 'Please enter a valid published year';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm() || !book) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const updatedBook = await updateBook(book.id, formData);
      setSuccess(true);
      
    
      

      setTimeout(() => {
        router.push(`/books/${updatedBook.id}`);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book');
    } finally {
      setSaving(false);
    }
  };

  if (!isSignedIn) {
    return null; 
  }

  if (loading) {
    return (
      <Container maxWidth="md" className="book-container">
        <Box className="book-loading">
          <CircularProgress sx={{ color: 'rgba(138, 43, 226, 0.8)' }} />
          <Typography sx={{ ml: 2 }}>Loading book details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="md" className="book-container">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Book not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/books')}
          className="book-btn-primary"
        >
          Back to Books
        </Button>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" className="book-container">
        <Box className="book-form-container" sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" className="book-title" sx={{ mb: 2 }}>
            Book Updated Successfully!
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
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/books')}
            className="book-btn-secondary"
          >
            Back to Books
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push(`/books/${book.id}`)}
            className="book-btn-secondary"
          >
            View Book
          </Button>
        </Stack>
      </Box>

   
   

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" className="book-title" sx={{ mb: 2 }}>
          <EditIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Edit Book
        </Typography>
        <Typography variant="h6" className="book-description">
          Update "{book.title}" information
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
        loading={saving}
        isEditing={true}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/books/${book.id}`)}
      />
    </Container>
  );
}
