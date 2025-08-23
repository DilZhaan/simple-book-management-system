# User Management Backend API

This is a comprehensive user management backend system built with Node.js, Express, GraphQL, and MongoDB for the Book Management System.

## Features

### Authentication & Authorization
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (admin, user)
- Secure session management

### GraphQL API
- Full CRUD operations for users
- Type-safe schema definitions
- Input validation
- Error handling

### User Management Operations
- User registration and login
- Profile management
- Password changes
- Admin-only operations (view all users, delete users, manage user status)

## API Endpoints

### REST Endpoints
- `GET /` - API information
- `GET /health` - Health check

### GraphQL Endpoint
- `POST /graphql` - GraphQL API

## GraphQL Schema

### Types

#### User
```graphql
type User {
  id: ID!
  username: String!
  email: String!
  role: UserRole!
  firstName: String
  lastName: String
  isActive: Boolean!
  createdAt: String!
  updatedAt: String!
}
```

#### UserRole
```graphql
enum UserRole {
  user
  admin
}
```

#### AuthPayload
```graphql
type AuthPayload {
  token: String!
  user: User!
}
```

### Queries

#### Public Queries (require authentication)
- `me: User` - Get current user profile
- `user(id: ID!): User` - Get user by ID (own profile or admin only)

#### Admin-only Queries
- `users(limit: Int, offset: Int, role: UserRole, isActive: Boolean): [User!]!` - List all users
- `searchUsers(query: String!, limit: Int, offset: Int): [User!]!` - Search users

### Mutations

#### Public Mutations
- `register(input: RegisterInput!): AuthPayload!` - User registration
- `login(input: LoginInput!): AuthPayload!` - User login
- `updateUser(id: ID!, input: UpdateUserInput!): User!` - Update user profile
- `changePassword(input: ChangePasswordInput!): User!` - Change password

#### Admin-only Mutations
- `deleteUser(id: ID!): Boolean!` - Delete user
- `toggleUserStatus(id: ID!): User!` - Activate/deactivate user

### Input Types

#### RegisterInput
```graphql
input RegisterInput {
  username: String!
  email: String!
  password: String!
  firstName: String
  lastName: String
  role: UserRole
}
```

#### LoginInput
```graphql
input LoginInput {
  email: String!
  password: String!
}
```

#### UpdateUserInput
```graphql
input UpdateUserInput {
  username: String
  email: String
  firstName: String
  lastName: String
  isActive: Boolean
  role: UserRole
}
```

#### ChangePasswordInput
```graphql
input ChangePasswordInput {
  currentPassword: String!
  newPassword: String!
}
```

## Authentication

All protected endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <jwt_token>
```

## Example Queries

### User Registration
```graphql
mutation {
  register(input: {
    username: "johndoe"
    email: "john@example.com"
    password: "securepassword"
    firstName: "John"
    lastName: "Doe"
  }) {
    token
    user {
      id
      username
      email
      role
    }
  }
}
```

### User Login
```graphql
mutation {
  login(input: {
    email: "john@example.com"
    password: "securepassword"
  }) {
    token
    user {
      id
      username
      email
      role
    }
  }
}
```

### Get Current User
```graphql
query {
  me {
    id
    username
    email
    firstName
    lastName
    role
    isActive
    createdAt
  }
}
```

### List Users (Admin only)
```graphql
query {
  users(limit: 10, offset: 0) {
    id
    username
    email
    role
    isActive
    createdAt
  }
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server Configuration
HOST=localhost
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/book-management-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

## Security Features

- Password hashing with bcrypt (cost factor 12)
- JWT token expiration
- Input validation with Joi
- Role-based access control
- CORS protection
- SQL injection protection through Mongoose ODM

## Development

### Prerequisites
- Node.js 18+
- MongoDB 4.4+

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npx nx serve backend
```

### Building for Production
```bash
npx nx build backend
```

## Database Schema

### User Collection
- `username`: String (unique, required, 3-30 chars)
- `email`: String (unique, required, valid email)
- `password`: String (required, hashed, min 6 chars)
- `role`: String (enum: 'user', 'admin', default: 'user')
- `firstName`: String (optional, max 50 chars)
- `lastName`: String (optional, max 50 chars)
- `isActive`: Boolean (default: true)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Indexes
- `email` (unique)
- `username` (unique)
- `role` (for filtering)

## Error Handling

The API returns appropriate HTTP status codes and GraphQL errors:

- `400` - Bad Request / Validation errors
- `401` - Unauthorized / Authentication required
- `403` - Forbidden / Insufficient privileges
- `404` - Not Found
- `500` - Internal Server Error

GraphQL errors include:
- `UNAUTHENTICATED` - Authentication required
- `FORBIDDEN` - Insufficient privileges
- `BAD_USER_INPUT` - Invalid input data