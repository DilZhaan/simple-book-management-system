import { GraphQLError } from 'graphql';

export class AuthError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 }
      }
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        http: { status: 400 }
      }
    });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(message: string = 'Resource not found') {
    super(message, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 }
      }
    });
  }
}

export class InternalError extends GraphQLError {
  constructor(message: string = 'Internal server error') {
    super(message, {
      extensions: {
        code: 'INTERNAL_ERROR',
        http: { status: 500 }
      }
    });
  }
}

// Logger utility
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} - ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`${new Date().toISOString()} - ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`${new Date().toISOString()} - ${message}`, data || '');
  },
  success: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} - ${message}`, data || '');
  }
};
