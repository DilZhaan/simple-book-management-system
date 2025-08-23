import { mergeResolvers } from '@graphql-tools/merge';
import { userResolvers } from './user/userResolvers';
import { bookResolvers } from './book/bookResolvers';

const resolvers = mergeResolvers([userResolvers, bookResolvers]);

export default resolvers;
