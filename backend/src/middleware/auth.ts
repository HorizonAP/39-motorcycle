import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { User } from '../models/User';

export const authenticateUser = (app: Elysia) =>
  app
    .use(jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-secret-key'
    }))
    .derive(async ({ headers, jwt }) => {
      const authorization = headers.authorization;
      
      if (!authorization) {
        throw new Error('Authentication required');
      }

      const token = authorization.replace('Bearer ', '');
      
      try {
        const payload = await jwt.verify(token);
        if (!payload) {
          throw new Error('Invalid token');
        }

        const user = await User.findById(payload.id);
        if (!user) {
          throw new Error('User not found');
        }

        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        };
      } catch (error) {
        throw new Error('Invalid token');
      }
    });
