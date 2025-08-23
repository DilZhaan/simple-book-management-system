import { mergeTypeDefs } from '@graphql-tools/merge';
import { baseTypeDefs } from './base/baseTypeDefs';
import { userTypeDefs } from './user/userTypeDefs';
import { bookTypeDefs } from './book/bookTypeDefs';

const typeDefs = mergeTypeDefs([baseTypeDefs, userTypeDefs, bookTypeDefs]);

export default typeDefs;
