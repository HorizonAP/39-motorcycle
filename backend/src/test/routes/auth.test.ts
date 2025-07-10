import { describe, it, expect, beforeEach } from 'vitest';
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { authRoutes } from '../../routes/auth';
import { createTestUser, createTestAdmin } from '../fixtures';
import bcrypt from 'bcryptjs';

// Create a test app with auth routes
const createTestApp = () => {
  return new Elysia()
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET || 'test-secret',
      })
    )
    .use(authRoutes);
};

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Database is cleared in global setup
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const app = createTestApp();

      const userData = {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'user',
      };

      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        })
      );

      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.message).toBe('User registered successfully');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.user.role).toBe('user');
      expect(result.token).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      const app = createTestApp();

      // Create a user first
      await createTestUser({ email: 'existing@test.com' });

      const userData = {
        name: 'Jane Doe',
        email: 'existing@test.com',
        password: 'password123',
        role: 'user',
      };

      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        })
      );

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const app = createTestApp();

      const invalidData = {
        name: 'John Doe',
        // missing email and password
        role: 'user',
      };

      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData),
        })
      );

      expect(response.status).toBe(400);
    });

    it('should default to user role when role not specified', async () => {
      const app = createTestApp();

      const userData = {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        // role not specified
      };

      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        })
      );

      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.user.role).toBe('user');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const app = createTestApp();

      // Create a user first
      const password = 'password123';
      const user = await createTestUser({
        email: 'login@test.com',
        passwordHash: await bcrypt.hash(password, 10),
      });

      const loginData = {
        email: 'login@test.com',
        password: password,
      };

      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.token).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const app = createTestApp();

      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        })
      );

      expect(response.status).toBe(401);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const app = createTestApp();

      // Create a user first
      const user = await createTestUser({
        email: 'test@test.com',
        passwordHash: await bcrypt.hash('correctpassword', 10),
      });

      const loginData = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        })
      );

      expect(response.status).toBe(401);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    it('should validate required fields', async () => {
      const app = createTestApp();

      const invalidData = {
        email: 'test@test.com',
        // missing password
      };

      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    it('should return user info with valid token', async () => {
      const app = createTestApp();

      // Create a user and get a token
      const user = await createTestUser({ email: 'me@test.com' });

      // First login to get a token
      const loginResponse = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'me@test.com',
            password: 'password123',
          }),
        })
      );

      const loginResult = await loginResponse.json();
      const token = loginResult.token;

      // Then test /auth/me
      const response = await app.handle(
        new Request('http://localhost/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('me@test.com');
    });

    it('should reject request without token', async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request('http://localhost/auth/me', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(401);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Authentication required');
    });

    it('should reject request with invalid token', async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request('http://localhost/auth/me', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        })
      );

      expect(response.status).toBe(401);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Authentication required');
    });
  });
});
