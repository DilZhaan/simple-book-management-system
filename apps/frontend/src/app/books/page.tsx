'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Pagination,
  Box,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../_context/AuthContext';
import { getBooks, searchBooks, deleteBook, Book, BookFilterInput } from './bookApi';
import '../assets/books.css';

const ITEMS_PER_PAGE = 12;

export default function BookList() {
  const router = useRouter();
  const { isSignedIn, user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [filters, setFilters] = useState<BookFilterInput>({});
  const [showFilters, setShowFilters] = useState(false);

  // Load books with current filters and pagination
  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      let result: Book[];
      
      if (searchQuery.trim()) {
        result = await searchBooks(searchQuery, ITEMS_PER_PAGE, offset);
      } else {
        result = await getBooks(filters, ITEMS_PER_PAGE, offset);
      }
      
      setBooks(result);
      setTotalBooks(result.length + offset); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filters]);



  useEffect(() => {
    loadBooks();
  }, [loadBooks]);


  

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1);
    loadBooks();
  };


  

  const handleFilterChange = (field: keyof BookFilterInput, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    setCurrentPage(1);
  };


  

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };


  

  const handleDeleteBook = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deleteBook(id);
      await loadBooks(); // Reload the books list
      alert('Book deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };


  

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };


  

  const totalPages = Math.ceil(totalBooks / ITEMS_PER_PAGE);

  return (
    <Container maxWidth="xl" className="book-container">


      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" className="book-title" sx={{ mb: 2 }}>
          Book Library
        </Typography>
        <Typography variant="h6" className="book-description" sx={{ mb: 3 }}>
          Discover, manage, and explore our collection of books
        </Typography>
      </Box>




      <Box className="book-search-container">
        <form onSubmit={handleSearch}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search books by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="book-search-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchQuery('')} size="small">
                        <ClearIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                className="book-btn-primary"
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  className="book-btn-secondary"
                >
                  Filters
                </Button>
                {isSignedIn && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/books/add')}
                    className="book-btn-primary"
                  >
                    Add Book
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </form>




        {showFilters && (
          <Box sx={{ mt: 3, p: 3, border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Filter by Author"
                  value={filters.author || ''}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="book-search-field"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Filter by Genre"
                  value={filters.genre || ''}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="book-search-field"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Published Year"
                  type="number"
                  value={filters.publishedYear || ''}
                  onChange={(e) => handleFilterChange('publishedYear', parseInt(e.target.value) || undefined)}
                  className="book-search-field"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  className="book-btn-secondary"
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>




      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

  
  

      {loading ? (
        <Box className="book-loading">
          <CircularProgress sx={{ color: 'rgba(138, 43, 226, 0.8)' }} />
          <Typography sx={{ ml: 2 }}>Loading books...</Typography>
        </Box>
      ) : (
        <>
  
  

          {books.length > 0 ? (
            <Grid container spacing={3}>
              {books.map((book) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                  <Card className="book-card">
                    <CardContent>
                      <Typography variant="h6" className="book-title" noWrap>
                        {book.title}
                      </Typography>
                      <Typography variant="subtitle1" className="book-author" sx={{ mb: 1 }}>
                        by {book.author}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                          label={book.genre}
                          size="small"
                          className="book-chip"
                        />
                        <Chip
                          label={book.publishedYear}
                          size="small"
                          variant="outlined"
                          className="book-chip"
                        />
                      </Stack>
                      <Typography variant="body2" className="book-description" sx={{ mb: 2 }}>
                        Added by {book.createdBy.username}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => router.push(`/books/${book.id}`)}
                        className="book-btn-secondary"
                      >
                        View
                      </Button>
                      {isSignedIn && user?.id === book.createdBy.id && (
                        <>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => router.push(`/books/edit/${book.id}`)}
                            className="book-btn-secondary"
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteBook(book.id, book.title)}
                            className="book-btn-danger"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box className="book-empty-state">
              <Typography variant="h6" sx={{ mb: 2 }}>
                No books found
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {searchQuery || Object.keys(filters).length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to add a book to the library!'}
              </Typography>
              {isSignedIn && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/books/add')}
                  className="book-btn-primary"
                >
                  Add First Book
                </Button>
              )}
            </Box>
          )}

         
         
         
          {books.length > 0 && totalPages > 1 && (
            <Box className="book-pagination">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
