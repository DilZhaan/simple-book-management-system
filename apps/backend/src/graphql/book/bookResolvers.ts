import { Book, IBook } from '../../models/Book';
import { User, IUser } from '../../models/User';
import { getCurrentUser } from '../user/userResolvers';
import { Context } from '../user/userResolvers';
import { AuthError, ValidationError, InternalError, NotFoundError, logger } from '../../utils/errors';

export const bookResolvers = {
  Book: {
    createdBy: async (book: IBook): Promise<IUser | null> => {
      return await User.findById(book.createdBy).select('-password');
    },
  },

  Query: {
    books: async (
      _: any, 
      { filter, limit = 10, offset = 0 }: { 
        filter?: any; 
        limit?: number; 
        offset?: number; 
      }, 
      context: Context
    ): Promise<IBook[]> => {
      await getCurrentUser(context);
      
      const query: any = {};
      
      if (filter) {
        if (filter.title) {
          query.title = { $regex: filter.title, $options: 'i' };
        }
        if (filter.author) {
          query.author = { $regex: filter.author, $options: 'i' };
        }
        if (filter.genre) {
          query.genre = { $regex: filter.genre, $options: 'i' };
        }
        if (filter.publishedYear) {
          query.publishedYear = filter.publishedYear;
        }
      }
      
      return await Book.find(query)
        .populate('createdBy', '-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },

    book: async (_: any, { id }: { id: string }, context: Context): Promise<IBook> => {
      await getCurrentUser(context);
      
      const book = await Book.findById(id).populate('createdBy', '-password');
      if (!book) {
        throw new NotFoundError('Book not found');
      }
      
      return book;
    },

    searchBooks: async (
      _: any, 
      { query, limit = 10, offset = 0 }: { 
        query: string; 
        limit?: number; 
        offset?: number; 
      }, 
      context: Context
    ): Promise<IBook[]> => {
      await getCurrentUser(context);
      
      const searchQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
          { genre: { $regex: query, $options: 'i' } },
        ],
      };
      
      return await Book.find(searchQuery)
        .populate('createdBy', '-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },

    booksByGenre: async (
      _: any, 
      { genre, limit = 10, offset = 0 }: { 
        genre: string; 
        limit?: number; 
        offset?: number; 
      }, 
      context: Context
    ): Promise<IBook[]> => {
      await getCurrentUser(context);
      
      return await Book.find({ genre: { $regex: genre, $options: 'i' } })
        .populate('createdBy', '-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },

    booksByAuthor: async (
      _: any, 
      { author, limit = 10, offset = 0 }: { 
        author: string; 
        limit?: number; 
        offset?: number; 
      }, 
      context: Context
    ): Promise<IBook[]> => {
      await getCurrentUser(context);
      
      return await Book.find({ author: { $regex: author, $options: 'i' } })
        .populate('createdBy', '-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },
  },

  Mutation: {
    createBook: async (
      _: any, 
      { input }: { input: any }, 
      context: Context
    ): Promise<IBook> => {
      try {
        const currentUser = await getCurrentUser(context);
        
        // Validate input
        if (!input.title || input.title.trim().length === 0) {
          throw new ValidationError('Title is required');
        }
        if (!input.author || input.author.trim().length === 0) {
          throw new ValidationError('Author is required');
        }
        if (!input.genre || input.genre.trim().length === 0) {
          throw new ValidationError('Genre is required');
        }
        if (!input.publishedYear || input.publishedYear < 1000) {
          throw new ValidationError('Valid published year is required');
        }
        if (input.publishedYear > new Date().getFullYear() + 10) {
          throw new ValidationError('Published year cannot be more than 10 years in the future');
        }
        
        const book = new Book({
          title: input.title.trim(),
          author: input.author.trim(),
          publishedYear: input.publishedYear,
          genre: input.genre.trim(),
          createdBy: (currentUser._id as any),
        });
        
        await book.save();
        await book.populate('createdBy', '-password');
        
        logger.success(`Book created: ${book.title} by ${currentUser.username}`);
        return book;
      } catch (error) {
        if (error instanceof ValidationError || error instanceof AuthError) {
          throw error;
        }
        
        logger.error('Book creation failed', error);
        throw new InternalError('Failed to create book');
      }
    },

    updateBook: async (
      _: any, 
      { id, input }: { id: string; input: any }, 
      context: Context
    ): Promise<IBook> => {
      try {
        const currentUser = await getCurrentUser(context);
        
        const book = await Book.findById(id);
        if (!book) {
          throw new NotFoundError('Book not found');
        }
        
        // Check if user is the creator of the book
        if (book.createdBy.toString() !== (currentUser._id as any).toString()) {
          throw new AuthError('You can only update books you created');
        }
        
        // Validate input
        const updateData: any = {};
        
        if (input.title !== undefined) {
          if (!input.title || input.title.trim().length === 0) {
            throw new ValidationError('Title cannot be empty');
          }
          updateData.title = input.title.trim();
        }
        
        if (input.author !== undefined) {
          if (!input.author || input.author.trim().length === 0) {
            throw new ValidationError('Author cannot be empty');
          }
          updateData.author = input.author.trim();
        }
        
        if (input.genre !== undefined) {
          if (!input.genre || input.genre.trim().length === 0) {
            throw new ValidationError('Genre cannot be empty');
          }
          updateData.genre = input.genre.trim();
        }
        
        if (input.publishedYear !== undefined) {
          if (input.publishedYear < 1000) {
            throw new ValidationError('Valid published year is required');
          }
          if (input.publishedYear > new Date().getFullYear() + 10) {
            throw new ValidationError('Published year cannot be more than 10 years in the future');
          }
          updateData.publishedYear = input.publishedYear;
        }
        
        const updatedBook = await Book.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true, runValidators: true }
        ).populate('createdBy', '-password');
        
        if (!updatedBook) {
          throw new NotFoundError('Book not found');
        }
        
        logger.success(`Book updated: ${updatedBook.title} by ${currentUser.username}`);
        return updatedBook;
      } catch (error) {
        if (error instanceof ValidationError || error instanceof AuthError || error instanceof NotFoundError) {
          throw error;
        }
        
        logger.error('Book update failed', error);
        throw new InternalError('Failed to update book');
      }
    },

    deleteBook: async (
      _: any, 
      { id }: { id: string }, 
      context: Context
    ): Promise<string> => {
      try {
        const currentUser = await getCurrentUser(context);
        
        const book = await Book.findById(id);
        if (!book) {
          throw new NotFoundError('Book not found');
        }
        
        // Check if user is the creator of the book
        if (book.createdBy.toString() !== (currentUser._id as any).toString()) {
          throw new AuthError('You can only delete books you created');
        }
        
        await Book.findByIdAndDelete(id);
        
        logger.success(`Book deleted: ${book.title} by ${currentUser.username}`);
        return `Book "${book.title}" has been successfully deleted`;
      } catch (error) {
        if (error instanceof ValidationError || error instanceof AuthError || error instanceof NotFoundError) {
          throw error;
        }
        
        logger.error('Book deletion failed', error);
        throw new InternalError('Failed to delete book');
      }
    },
  },
};
