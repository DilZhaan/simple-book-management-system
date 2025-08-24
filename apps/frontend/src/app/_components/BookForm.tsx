'use client';
import React from 'react';
import {
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon
} from '@mui/icons-material';



export const BOOK_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Thriller',
  'Biography',
  'History',
  'Self-Help',
  'Business',
  'Technology',
  'Science',
  'Poetry',
  'Drama',
  'Horror',
  'Adventure',
  'Children',
  'Young Adult',
  'Educational',
  'Other'
];

export interface BookFormData {
  title: string;
  author: string;
  publishedYear: number;
  genre: string;
}

export interface BookFormErrors {
  title?: string;
  author?: string;
  publishedYear?: string;
  genre?: string;
}

interface BookFormProps {
  formData: BookFormData;
  formErrors: BookFormErrors;
  loading: boolean;
  isEditing?: boolean;
  onInputChange: (field: keyof BookFormData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const currentYear = new Date().getFullYear();

export default function BookForm({
  formData,
  formErrors,
  loading,
  isEditing = false,
  onInputChange,
  onSubmit,
  onCancel
}: BookFormProps) {
  return (
    <Card className="book-form-container">
      <CardContent sx={{ p: 4 }}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={3} className="book-form-grid">
            {/* Title */}
            <Grid item xs={12} className="book-form-field-container">
              <TextField
                fullWidth
                label="Book Title"
                value={formData.title || ''}
                onChange={(e) => onInputChange('title', e.target.value)}
                error={!!formErrors.title}
                helperText={formErrors.title}
                className="book-form-field"
                required
                placeholder="Enter the book title"
                disabled={loading}
              />
            </Grid>

            {/* Author */}
            <Grid item xs={12} md={6} className="book-form-field-container">
              <TextField
                fullWidth
                label="Author"
                value={formData.author || ''}
                onChange={(e) => onInputChange('author', e.target.value)}
                error={!!formErrors.author}
                helperText={formErrors.author}
                className="book-form-field"
                required
                placeholder="Enter the author's name"
                disabled={loading}
              />
            </Grid>

            {/* Published Year */}
            <Grid item xs={12} md={6} className="book-form-field-container">
              <TextField
                fullWidth
                label="Published Year"
                type="number"
                value={formData.publishedYear || ''}
                onChange={(e) => onInputChange('publishedYear', parseInt(e.target.value) || 0)}
                error={!!formErrors.publishedYear}
                helperText={formErrors.publishedYear}
                className="book-form-field"
                required
                disabled={loading}
                inputProps={{
                  min: 1,
                  max: currentYear + 1
                }}
                placeholder={`e.g., ${currentYear}`}
              />
            </Grid>

            {/* Genre */}
            <Grid item xs={12} className="book-form-field-container">
              <FormControl fullWidth className="book-form-field" error={!!formErrors.genre}>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={formData.genre || ''}
                  label="Genre"
                  onChange={(e) => onInputChange('genre', e.target.value)}
                  required
                  disabled={loading}
                >
                  {BOOK_GENRES.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.genre && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {formErrors.genre}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12}>
              <div className="book-form-action-buttons">
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={loading}
                  className="book-btn-secondary"
                  sx={{ minWidth: '120px' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? (
                    <CircularProgress size={16} />
                  ) : isEditing ? (
                    <SaveIcon />
                  ) : (
                    <AddIcon />
                  )}
                  className="book-btn-primary"
                  sx={{ minWidth: '140px' }}
                >
                  {loading 
                    ? (isEditing ? 'Updating...' : 'Adding...') 
                    : (isEditing ? 'Update Book' : 'Add Book')
                  }
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
