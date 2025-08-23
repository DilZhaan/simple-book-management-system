import { userTypeDefs } from './typeDefs/userTypes';
import { userResolvers } from './resolvers/userResolvers';

// Combine all type definitions
export const typeDefs = `
  ${userTypeDefs}
`;

// Combine all resolvers
export const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
} as any;