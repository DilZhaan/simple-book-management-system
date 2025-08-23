import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  publishedYear: number;
  genre: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      minlength: [1, 'Author cannot be empty'],
      maxlength: [100, 'Author cannot exceed 100 characters'],
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
      min: [1000, 'Published year must be at least 1000'],
      max: [new Date().getFullYear() + 10, 'Published year cannot be more than 10 years in the future'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      minlength: [1, 'Genre cannot be empty'],
      maxlength: [50, 'Genre cannot exceed 50 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
BookSchema.index({ title: 1 });
BookSchema.index({ author: 1 });
BookSchema.index({ genre: 1 });
BookSchema.index({ publishedYear: 1 });
BookSchema.index({ createdBy: 1 });

// Compound index for search functionality
BookSchema.index({ 
  title: 'text', 
  author: 'text', 
  genre: 'text' 
});

export const Book = mongoose.model<IBook>('Book', BookSchema);
