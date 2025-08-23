import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { connectDatabase } from './configs/database';
import { typeDefs } from './graphql/typeDefs';
import { resolvers, Context } from './graphql/resolvers';

// Load environment variables
dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  // Connect to database
  await connectDatabase();

  // Create Apollo Server
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    csrfPrevention: false, // Disable CSRF for development/testing
  });

  // Start the standalone server
  const { url } = await startStandaloneServer(server, {
    listen: { port, host },
    context: async ({ req }): Promise<Context> => {
      return {
        req,
      };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
  console.log(`📊 GraphQL endpoint: ${url}graphql`);
}

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
