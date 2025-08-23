import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-management-system';
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing without database connection for development...');
    // Don't exit in development to allow testing GraphQL schema
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;