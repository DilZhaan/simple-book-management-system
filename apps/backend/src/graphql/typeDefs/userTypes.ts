export const userTypeDefs = `
  enum UserRole {
    user
    admin
  }

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

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    firstName: String
    lastName: String
    role: UserRole
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    username: String
    email: String
    firstName: String
    lastName: String
    isActive: Boolean
    role: UserRole
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  type Query {
    # Get current user profile
    me: User
    
    # Get user by ID (admin only or own profile)
    user(id: ID!): User
    
    # Get all users (admin only)
    users(
      limit: Int = 10
      offset: Int = 0
      role: UserRole
      isActive: Boolean
    ): [User!]!
    
    # Search users by username or email (admin only)
    searchUsers(
      query: String!
      limit: Int = 10
      offset: Int = 0
    ): [User!]!
  }

  type Mutation {
    # User registration
    register(input: RegisterInput!): AuthPayload!
    
    # User login
    login(input: LoginInput!): AuthPayload!
    
    # Update user profile
    updateUser(id: ID!, input: UpdateUserInput!): User!
    
    # Change password
    changePassword(input: ChangePasswordInput!): User!
    
    # Delete user (admin only)
    deleteUser(id: ID!): Boolean!
    
    # Activate/Deactivate user (admin only)
    toggleUserStatus(id: ID!): User!
  }
`;