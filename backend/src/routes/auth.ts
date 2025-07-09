import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const authRoutes = (app: Elysia) =>
  app
    .group('/auth', (app) =>
      app
        .post('/login', async ({ body, jwt }) => {
          const { email, password } = body as { email: string; password: string };

          // Find user by email
          const user = await User.findOne({ email });
          if (!user) {
            return {
              success: false,
              message: 'Invalid email or password'
            };
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (!isValidPassword) {
            return {
              success: false,
              message: 'Invalid email or password'
            };
          }

          // Generate JWT token
          const token = await jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role
          });

          return {
            success: true,
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          };
        })

        .post('/register', async ({ body, jwt }) => {
          const { name, email, password, role } = body as {
            name: string;
            email: string;
            password: string;
            role?: 'admin' | 'user';
          };

          // Check if user already exists
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return {
              success: false,
              message: 'User already exists with this email'
            };
          }

          // Hash password
          const passwordHash = await bcrypt.hash(password, 10);

          // Create new user
          const user = new User({
            name,
            email,
            passwordHash,
            role: role || 'user'
          });

          await user.save();

          // Generate JWT token
          const token = await jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role
          });

          return {
            success: true,
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          };
        })

        .get('/verify', async ({ headers, jwt }) => {
          const authorization = headers.authorization;
          if (!authorization) {
            return {
              success: false,
              message: 'No token provided'
            };
          }

          const token = authorization.replace('Bearer ', '');
          try {
            const payload = await jwt.verify(token);
            if (!payload) {
              return {
                success: false,
                message: 'Invalid token'
              };
            }

            const user = await User.findById(payload.id);
            if (!user) {
              return {
                success: false,
                message: 'User not found'
              };
            }

            return {
              success: true,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            };
          } catch (error) {
            return {
              success: false,
              message: 'Invalid token'
            };
          }
        })
    );
