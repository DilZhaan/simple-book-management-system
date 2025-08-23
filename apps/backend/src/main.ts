import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import connectDB from './config/database';
import { typeDefs, resolvers } from './graphql/schema';
import { verifyToken } from './middleware/auth';
import User from './models/User';
import { CORS_CONFIG } from './config/auth';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  // Connect to database
  await connectDB();

  const app = express();
  const httpServer = http.createServer(app);

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code,
        path: error.path,
      };
    },
  });

  await server.start();

  // Configure middleware
  app.use(cors(CORS_CONFIG));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  // GraphQL endpoint with authentication context
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.userId);
            
            if (user && user.isActive) {
              return { user };
            }
          } catch (error) {
            // Invalid token, continue without user context
            console.log('Invalid token provided');
          }
        }
        
        return {};
      },
    })
  );

  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Book Management System API',
      status: 'running',
      graphql: '/graphql',
      timestamp: new Date().toISOString(),
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Start the server
  await new Promise<void>((resolve) =>
    httpServer.listen({ port, host }, resolve)
  );

  console.log(`🚀 Server ready at http://${host}:${port}/`);
  console.log(`📊 GraphQL endpoint: http://${host}:${port}/graphql`);
}

// Start the server and handle errors
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
