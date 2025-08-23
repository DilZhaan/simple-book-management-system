import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { JWT_CONFIG, USER_ROLES, UserRole } from '../config/auth';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Generate JWT token
export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: (user as any)._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  } as jwt.SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Access denied. No token provided or invalid format.' 
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({ 
        error: 'Access denied. User not found or inactive.' 
      });
      return;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Access denied. Invalid token.' 
    });
  }
};

// Authorization middleware factory
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Access denied. Authentication required.' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Access denied. Insufficient privileges.' 
      });
      return;
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = authorize(USER_ROLES.ADMIN);

// Middleware to check if user owns resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Access denied. Authentication required.' 
      });
      return;
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    const currentUserId = (req.user as any)._id.toString();

    // Allow if user is admin or owns the resource
    if (req.user.role === USER_ROLES.ADMIN || resourceUserId === currentUserId) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Access denied. You can only access your own resources.' 
      });
    }
  };
};