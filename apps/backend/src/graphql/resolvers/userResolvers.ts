import { GraphQLError } from 'graphql';
import User, { IUser } from '../../models/User';
import { generateToken } from '../../middleware/auth';
import { USER_ROLES } from '../../config/auth';
import {
  validateInput,
  registerValidation,
  loginValidation,
  updateUserValidation,
  changePasswordValidation,
} from '../../utils/validation';

interface Context {
  user?: IUser;
}

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface UpdateUserInput {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  role?: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// Custom error classes
class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
}

class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
}

class UserInputError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
      },
    });
  }
}

export const userResolvers = {
  Query: {
    // Get current user profile
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }
      return context.user;
    },

    // Get user by ID
    user: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      // Users can only view their own profile, admins can view any profile
      if (context.user.role !== USER_ROLES.ADMIN && (context.user as any)._id.toString() !== id) {
        throw new ForbiddenError('You can only access your own profile');
      }

      const user = await User.findById(id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      return user;
    },

    // Get all users (admin only)
    users: async (
      _: any,
      { 
        limit = 10, 
        offset = 0, 
        role, 
        isActive 
      }: { 
        limit?: number; 
        offset?: number; 
        role?: string; 
        isActive?: boolean 
      },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      if (context.user.role !== USER_ROLES.ADMIN) {
        throw new ForbiddenError('Only administrators can view all users');
      }

      const filter: any = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive;

      return User.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },

    // Search users (admin only)
    searchUsers: async (
      _: any,
      { 
        query, 
        limit = 10, 
        offset = 0 
      }: { 
        query: string; 
        limit?: number; 
        offset?: number 
      },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      if (context.user.role !== USER_ROLES.ADMIN) {
        throw new ForbiddenError('Only administrators can search users');
      }

      const searchRegex = new RegExp(query, 'i');
      return User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },
  },

  Mutation: {
    // User registration
    register: async (_: any, { input }: { input: RegisterInput }) => {
      try {
        // Validate input
        const validatedInput = validateInput(registerValidation, input);

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: validatedInput.email },
            { username: validatedInput.username },
          ],
        });

        if (existingUser) {
          throw new UserInputError('User with this email or username already exists');
        }

        // Create new user
        const user = new User(validatedInput);
        await user.save();

        // Generate token
        const token = generateToken(user);

        return {
          token,
          user,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new UserInputError(error.message);
        }
        throw new UserInputError('Registration failed');
      }
    },

    // User login
    login: async (_: any, { input }: { input: LoginInput }) => {
      try {
        // Validate input
        const validatedInput = validateInput(loginValidation, input);

        // Find user and include password for comparison
        const user = await User.findOne({ email: validatedInput.email }).select('+password');

        if (!user || !user.isActive) {
          throw new AuthenticationError('Invalid credentials or account is inactive');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(validatedInput.password);
        if (!isPasswordValid) {
          throw new AuthenticationError('Invalid credentials');
        }

        // Generate token
        const token = generateToken(user);

        return {
          token,
          user,
        };
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new UserInputError('Login failed');
      }
    },

    // Update user profile
    updateUser: async (
      _: any,
      { id, input }: { id: string; input: UpdateUserInput },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      // Users can only update their own profile, admins can update any profile
      if (context.user.role !== USER_ROLES.ADMIN && (context.user as any)._id.toString() !== id) {
        throw new ForbiddenError('You can only update your own profile');
      }

      // Only admins can change roles and isActive status
      if (context.user.role !== USER_ROLES.ADMIN) {
        delete input.role;
        delete input.isActive;
      }

      try {
        // Validate input
        const validatedInput = validateInput(updateUserValidation, input);

        // Check if username or email is already taken by another user
        if (validatedInput.username || validatedInput.email) {
          const existingUser = await User.findOne({
            _id: { $ne: id },
            $or: [
              ...(validatedInput.username ? [{ username: validatedInput.username }] : []),
              ...(validatedInput.email ? [{ email: validatedInput.email }] : []),
            ],
          });

          if (existingUser) {
            throw new UserInputError('Username or email is already taken');
          }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
          id,
          { $set: validatedInput },
          { new: true, runValidators: true }
        );

        if (!user) {
          throw new UserInputError('User not found');
        }

        return user;
      } catch (error) {
        if (error instanceof Error) {
          throw new UserInputError(error.message);
        }
        throw new UserInputError('Update failed');
      }
    },

    // Change password
    changePassword: async (
      _: any,
      { input }: { input: ChangePasswordInput },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      try {
        // Validate input
        const validatedInput = validateInput(changePasswordValidation, input);

        // Get user with password
        const user = await User.findById((context.user as any)._id).select('+password');
        if (!user) {
          throw new UserInputError('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(validatedInput.currentPassword);
        if (!isCurrentPasswordValid) {
          throw new AuthenticationError('Current password is incorrect');
        }

        // Update password
        user.password = validatedInput.newPassword;
        await user.save();

        return user;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        if (error instanceof Error) {
          throw new UserInputError(error.message);
        }
        throw new UserInputError('Password change failed');
      }
    },

    // Delete user (admin only)
    deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      if (context.user.role !== USER_ROLES.ADMIN) {
        throw new ForbiddenError('Only administrators can delete users');
      }

      // Prevent admin from deleting themselves
      if ((context.user as any)._id.toString() === id) {
        throw new ForbiddenError('You cannot delete your own account');
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      return true;
    },

    // Toggle user status (admin only)
    toggleUserStatus: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      if (context.user.role !== USER_ROLES.ADMIN) {
        throw new ForbiddenError('Only administrators can change user status');
      }

      // Prevent admin from deactivating themselves
      if ((context.user as any)._id.toString() === id) {
        throw new ForbiddenError('You cannot change your own account status');
      }

      const user = await User.findById(id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      user.isActive = !user.isActive;
      await user.save();

      return user;
    },
  },
};