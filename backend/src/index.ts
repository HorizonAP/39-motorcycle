import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { jwt } from '@elysiajs/jwt';
import connectDB from './config/database';
import { authRoutes } from './routes/auth';
import { partRoutes } from './routes/parts';
import { stockRoutes } from './routes/stock';
import { workOrderRoutes } from './routes/workOrders';

// Connect to database
await connectDB();

const app = new Elysia()
  .use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'Motorcycle Workshop API',
        version: '1.0.0',
        description: 'API for motorcycle workshop stock management system'
      }
    }
  }))
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-secret-key'
  }))
  .get('/', () => ({
    message: 'Motorcycle Workshop API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }))
  .get('/health', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString()
  }))
  .use(authRoutes)
  .use(partRoutes)
  .use(stockRoutes)
  .use(workOrderRoutes)
  .onError(({ code, error, set }) => {
    console.error('API Error:', error);
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        message: 'Validation error',
        error: error.message
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        message: 'Endpoint not found'
      };
    }

    // Handle authentication errors
    if (error.message.includes('Authentication required') || 
        error.message.includes('Invalid token') ||
        error.message.includes('User not found')) {
      set.status = 401;
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    set.status = 500;
    return {
      success: false,
      message: 'Internal server error'
    };
  })
  .listen(process.env.PORT || 3001);

console.log(`🚀 Server is running on port ${app.server?.port}`);
console.log(`📚 Swagger documentation available at http://localhost:${app.server?.port}/swagger`);

export default app;
