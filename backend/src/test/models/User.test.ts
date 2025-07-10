import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '../../models/User';
import { createTestUser, createTestAdmin } from '../fixtures';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  beforeEach(async () => {
    // Database is cleared in global setup
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'user',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe('user');
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should create an admin user', async () => {
      const admin = await createTestAdmin();

      expect(admin.role).toBe('admin');
      expect(admin.email).toBe('admin@workshop.com');
    });

    it('should default to user role if not specified', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('user');
    });
  });

  describe('User Validation', () => {
    it('should require name', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require email', async () => {
      const userData = {
        name: 'Test User',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require unique email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      const duplicateUser = {
        name: 'Another User',
        email: 'duplicate@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      const user = new User(duplicateUser);

      await expect(user.save()).rejects.toThrow();
    });

    it('should convert email to lowercase', async () => {
      const userData = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });

    it('should only allow valid roles', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'invalid-role' as any,
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Security', () => {
    it('should hash passwords correctly', async () => {
      const plainPassword = 'test123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);

      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });
});
