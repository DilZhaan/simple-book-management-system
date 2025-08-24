'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  MenuBook as BookIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../_context/AuthContext';
import { getBook, deleteBook, Book } from '../bookApi';
import '../../assets/books.css';

export default function BookDetail() {
  const router = useRouter();
  const params = useParams();
  const { isSignedIn, user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const bookId = params.id as string;


  

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const bookData = await getBook(bookId);
        if (bookData) {
          setBook(bookData);
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


  

  const handleDeleteBook = async () => {
    if (!book) return;

    try {
      setDeleting(true);
      await deleteBook(book.id);
      setDeleteDialogOpen(false);
      router.push('/books');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete book');
    } finally {
      setDeleting(false);
    }
  };

  
  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  

  const canEdit = isSignedIn && user && book && user.id === book.createdBy.id;

  if (loading) {
    return (
      <Container maxWidth="lg" className="book-container">
        <Box className="book-loading">
          <CircularProgress sx={{ color: 'rgba(138, 43, 226, 0.8)' }} />
          <Typography sx={{ ml: 2 }}>Loading book details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="lg" className="book-container">
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

  return (
    <Container maxWidth="lg" className="book-container">
   
   

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

      <Grid container spacing={4}>
       
       

        <Grid item xs={12} md={8}>
          <Card className="book-card">
            <CardContent sx={{ p: 4 }}>
              {/* Book Header */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" className="book-title" sx={{ mb: 2 }}>
                  {book.title}
                </Typography>
                <Typography variant="h5" className="book-author" sx={{ mb: 3 }}>
                  by {book.author}
                </Typography>
                
                <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                  <Chip
                    icon={<CategoryIcon />}
                    label={book.genre}
                    className="book-chip"
                    size="medium"
                  />
                  <Chip
                    icon={<CalendarIcon />}
                    label={`Published ${book.publishedYear}`}
                    variant="outlined"
                    className="book-chip"
                    size="medium"
                  />
                </Stack>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />



              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" className="book-description" sx={{ mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Added by
                    </Typography>
                    <Typography variant="body1" className="book-author">
                      {book.createdBy.username}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" className="book-description" sx={{ mb: 1 }}>
                      <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Date Added
                    </Typography>
                    <Typography variant="body1" className="book-year">
                      {formatDate(book.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                {book.updatedAt !== book.createdAt && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" className="book-description" sx={{ mb: 1 }}>
                        <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Last Updated
                      </Typography>
                      <Typography variant="body1" className="book-year">
                        {formatDate(book.updatedAt)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>



        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
      
      

            <Card className="book-card">
              <CardContent>
                <Typography variant="h6" className="book-title" sx={{ mb: 2 }}>
                  <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Quick Info
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" className="book-description">
                      Title
                    </Typography>
                    <Typography variant="body2" className="book-author">
                      {book.title}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="book-description">
                      Author
                    </Typography>
                    <Typography variant="body2" className="book-author">
                      {book.author}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="book-description">
                      Genre
                    </Typography>
                    <Typography variant="body2" className="book-genre">
                      {book.genre}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="book-description">
                      Published Year
                    </Typography>
                    <Typography variant="body2" className="book-year">
                      {book.publishedYear}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>



            {canEdit && (
              <Card className="book-card">
                <CardContent>
                  <Typography variant="h6" className="book-title" sx={{ mb: 2 }}>
                    Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={() => router.push(`/books/edit/${book.id}`)}
                      className="book-btn-primary"
                    >
                      Edit Book
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialogOpen(true)}
                      className="book-btn-danger"
                    >
                      Delete Book
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>



      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="book-title">
          Delete Book
        </DialogTitle>
        <DialogContent>
          <Typography className="book-description">
            Are you sure you want to delete "{book.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className="book-btn-secondary"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteBook}
            className="book-btn-danger"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
