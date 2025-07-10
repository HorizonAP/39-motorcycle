import { describe, it, expect, beforeEach } from 'vitest';
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { partRoutes } from '../../routes/parts';
import { authenticateUser } from '../../middleware/auth';
import { createTestUser, createTestAdmin, createTestPart } from '../fixtures';
import { Part } from '../../models/Part';
import bcrypt from 'bcryptjs';

// Create a test app with parts routes
const createTestApp = () => {
  return new Elysia()
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET || 'test-secret',
      })
    )
    .use(authenticateUser)
    .use(partRoutes);
};

// Helper function to get auth token
const getAuthToken = async (
  app: Elysia,
  email: string,
  password: string = 'password123'
) => {
  // Create user and login to get token
  await createTestUser({
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'admin',
  });

  const loginResponse = await app.handle(
    new Request('http://localhost/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  );

  const loginResult = await loginResponse.json();
  return loginResult.token;
};

describe('Parts Routes', () => {
  beforeEach(async () => {
    // Database is cleared in global setup
  });

  describe('GET /parts', () => {
    it('should return all parts', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'test@test.com');

      // Create some test parts
      await createTestPart({ sku: 'PART-001', name: 'Brake Pad 1' });
      await createTestPart({ sku: 'PART-002', name: 'Brake Pad 2' });

      const response = await app.handle(
        new Request('http://localhost/parts', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.parts).toBeDefined();
      expect(result.parts).toHaveLength(2);
      expect(result.parts[0].sku).toBe('PART-001');
      expect(result.parts[1].sku).toBe('PART-002');
    });

    it('should require authentication', async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request('http://localhost/parts', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(401);
    });

    it('should support search by name', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'test@test.com');

      await createTestPart({ sku: 'PART-001', name: 'Brake Pad' });
      await createTestPart({ sku: 'PART-002', name: 'Oil Filter' });

      const response = await app.handle(
        new Request('http://localhost/parts?search=brake', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.parts).toHaveLength(1);
      expect(result.parts[0].name).toBe('Brake Pad');
    });

    it('should support pagination', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'test@test.com');

      // Create multiple parts
      for (let i = 1; i <= 5; i++) {
        await createTestPart({
          sku: `PART-${i.toString().padStart(3, '0')}`,
          name: `Part ${i}`,
        });
      }

      const response = await app.handle(
        new Request('http://localhost/parts?page=1&limit=2', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.parts).toHaveLength(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
    });
  });

  describe('GET /parts/:id', () => {
    it('should return a specific part', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'test@test.com');

      const part = await createTestPart({ sku: 'PART-001', name: 'Test Part' });

      const response = await app.handle(
        new Request(`http://localhost/parts/${part._id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.part).toBeDefined();
      expect(result.part._id).toBe(part._id.toString());
      expect(result.part.sku).toBe('PART-001');
      expect(result.part.name).toBe('Test Part');
    });

    it('should return 404 for non-existent part', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'test@test.com');

      const fakeId = '507f1f77bcf86cd799439011';

      const response = await app.handle(
        new Request(`http://localhost/parts/${fakeId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(404);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Part not found');
    });
  });

  describe('POST /parts', () => {
    it('should create a new part', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'admin@test.com');

      const partData = {
        sku: 'NEW-PART-001',
        name: 'New Brake Pad',
        description: 'High quality brake pad',
        unitPrice: 49.99,
        qtyAvailable: 10,
        minStockLevel: 5,
        category: 'Brakes',
        brand: 'TestBrand',
      };

      const response = await app.handle(
        new Request('http://localhost/parts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(partData),
        })
      );

      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Part created successfully');
      expect(result.part).toBeDefined();
      expect(result.part.sku).toBe(partData.sku);
      expect(result.part.name).toBe(partData.name);
      expect(result.part.unitPrice).toBe(partData.unitPrice);
    });

    it('should prevent duplicate SKU', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'admin@test.com');

      // Create a part first
      await createTestPart({ sku: 'DUPLICATE-SKU' });

      const partData = {
        sku: 'DUPLICATE-SKU',
        name: 'Another Part',
        unitPrice: 29.99,
        qtyAvailable: 5,
      };

      const response = await app.handle(
        new Request('http://localhost/parts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(partData),
        })
      );

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Part with this SKU already exists');
    });

    it('should validate required fields', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'admin@test.com');

      const invalidData = {
        name: 'Part without SKU',
        unitPrice: 29.99,
        // missing sku and qtyAvailable
      };

      const response = await app.handle(
        new Request('http://localhost/parts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(invalidData),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /parts/:id', () => {
    it('should update an existing part', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'admin@test.com');

      const part = await createTestPart({
        sku: 'UPDATE-TEST',
        name: 'Original Name',
      });

      const updateData = {
        name: 'Updated Name',
        unitPrice: 99.99,
        qtyAvailable: 20,
      };

      const response = await app.handle(
        new Request(`http://localhost/parts/${part._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Part updated successfully');
      expect(result.part.name).toBe(updateData.name);
      expect(result.part.unitPrice).toBe(updateData.unitPrice);
      expect(result.part.qtyAvailable).toBe(updateData.qtyAvailable);
    });

    it('should return 404 for non-existent part', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'admin@test.com');

      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };

      const response = await app.handle(
        new Request(`http://localhost/parts/${fakeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        })
      );

      expect(response.status).toBe(404);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Part not found');
    });
  });

  describe('DELETE /parts/:id', () => {
    it('should delete an existing part', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'admin@test.com');

      const part = await createTestPart({ sku: 'DELETE-TEST' });

      const response = await app.handle(
        new Request(`http://localhost/parts/${part._id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Part deleted successfully');
    });

    it('should return 404 for non-existent part', async () => {
      const app = createTestApp();
      const token = await getAuthToken(app, 'admin@test.com');

      const fakeId = '507f1f77bcf86cd799439011';

      const response = await app.handle(
        new Request(`http://localhost/parts/${fakeId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(404);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Part not found');
    });
  });
});
