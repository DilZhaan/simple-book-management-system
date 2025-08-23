export const userTypeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    me: User
    users: [User!]!
  }

  extend type Mutation {
    register(username: String!, password: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    logout: String!
  }
`;
