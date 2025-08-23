import { User, IUser } from '../models/User';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  verifyToken, 
  extractTokenFromHeader,
  JWTPayload 
} from '../utils/auth';
import { AuthError, ValidationError, InternalError, logger } from '../utils/errors';

export interface Context {
  req: any;
  user?: IUser | null;
}

const getCurrentUser = async (context: Context): Promise<IUser> => {
  const authHeader = context.req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    throw new AuthError('Authentication required');
  }

  try {
    const payload: JWTPayload = verifyToken(token);
    const user = await User.findById(payload.userId);
    
    if (!user) {
      throw new AuthError('User not found');
    }
    
    return user;
  } catch (error) {
    logger.error('Token verification failed', error);
    throw new AuthError('Invalid token');
  }
};

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context): Promise<IUser> => {
      return await getCurrentUser(context);
    },

    users: async (_: any, __: any, context: Context): Promise<IUser[]> => {
      await getCurrentUser(context);
      return await User.find({}).select('-password').sort({ createdAt: -1 });
    },
  },

  Mutation: {
    register: async (_: any, { username, password }: { username: string; password: string }) => {
      try {

        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new ValidationError('Username already exists');
        }

        if (!username || username.trim().length < 3) {
          throw new ValidationError('Username must be at least 3 characters long');
        }

        if (!password || password.length < 6) {
          throw new ValidationError('Password must be at least 6 characters long');
        }

        const hashedPassword = await hashPassword(password);
        const user = new User({
          username: username.trim(),
          password: hashedPassword,
        });

        await user.save();


        const token = generateToken(user);

        return {
          token,
          user,
        };
      } catch (error) {
        if (error instanceof ValidationError || error instanceof AuthError) {
          throw error;
        }
        
        if ((error as any).code === 11000) {
          throw new ValidationError('Username already exists');
        }
        
        logger.error('Registration failed', error);
        throw new InternalError('Registration failed');
      }
    },

    login: async (_: any, { username, password }: { username: string; password: string }) => {
      try {
        // Validate input
        if (!username || !password) {
          throw new ValidationError('Username and password are required');
        }

        const user = await User.findOne({ username: username.trim() });
        if (!user) {
          throw new ValidationError('Invalid username or password');
        }

        // Check password
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
          throw new ValidationError('Invalid username or password');
        }

        const token = generateToken(user);

        return {
          token,
          user,
        };
      } catch (error) {
        if (error instanceof ValidationError || error instanceof AuthError) {
          throw error;
        }
        
        logger.error('Login failed', error);
        throw new InternalError('Login failed');
      }
    },

    logout: async (_: any, __: any, context: Context): Promise<string> => {
      await getCurrentUser(context);
      return 'Logged out successfully';
    },
  },
};
