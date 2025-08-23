import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, UserRole } from '../config/auth';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be less than 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name must be less than 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name must be less than 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for better query performance
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser>('User', userSchema);