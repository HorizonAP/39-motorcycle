import { describe, it, expect, beforeEach } from 'vitest';
import { StockMovement } from '../../models/StockMovement';
import {
  createTestUser,
  createTestPart,
  createTestStockMovement,
} from '../fixtures';

describe('StockMovement Model', () => {
  beforeEach(async () => {
    // Database is cleared in global setup
  });

  describe('StockMovement Creation', () => {
    it('should create a stock movement with valid data', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      const movementData = {
        partId: part._id,
        type: 'IN',
        quantity: 10,
        refNo: 'REF-001',
        notes: 'Initial stock',
        createdBy: user._id,
      };

      const movement = new StockMovement(movementData);
      const savedMovement = await movement.save();

      expect(savedMovement.partId.toString()).toBe(part._id.toString());
      expect(savedMovement.type).toBe('IN');
      expect(savedMovement.quantity).toBe(10);
      expect(savedMovement.refNo).toBe('REF-001');
      expect(savedMovement.notes).toBe('Initial stock');
      expect(savedMovement.createdBy.toString()).toBe(user._id.toString());
      expect(savedMovement.createdAt).toBeDefined();
    });

    it('should create a stock movement using test helper', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      const movement = await createTestStockMovement(
        part._id.toString(),
        user._id.toString()
      );

      expect(movement.partId.toString()).toBe(part._id.toString());
      expect(movement.type).toBe('IN');
      expect(movement.quantity).toBe(10);
      expect(movement.createdBy.toString()).toBe(user._id.toString());
    });

    it('should handle OUT type movements', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      const movement = await createTestStockMovement(
        part._id.toString(),
        user._id.toString(),
        { type: 'OUT', quantity: 5 }
      );

      expect(movement.type).toBe('OUT');
      expect(movement.quantity).toBe(5);
    });
  });

  describe('StockMovement Validation', () => {
    it('should require partId', async () => {
      const user = await createTestUser();

      const movementData = {
        type: 'IN',
        quantity: 10,
        refNo: 'REF-001',
        createdBy: user._id,
      };

      const movement = new StockMovement(movementData);

      await expect(movement.save()).rejects.toThrow();
    });

    it('should require type', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      const movementData = {
        partId: part._id,
        quantity: 10,
        refNo: 'REF-001',
        createdBy: user._id,
      };

      const movement = new StockMovement(movementData);

      await expect(movement.save()).rejects.toThrow();
    });

    it('should require quantity', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      const movementData = {
        partId: part._id,
        type: 'IN',
        refNo: 'REF-001',
        createdBy: user._id,
      };

      const movement = new StockMovement(movementData);

      await expect(movement.save()).rejects.toThrow();
    });

    it('should only allow valid types (IN, OUT)', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      const movementData = {
        partId: part._id,
        type: 'INVALID',
        quantity: 10,
        refNo: 'REF-001',
        createdBy: user._id,
      };

      const movement = new StockMovement(movementData);

      await expect(movement.save()).rejects.toThrow();
    });

    it('should require positive quantity', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      const movementData = {
        partId: part._id,
        type: 'IN',
        quantity: -5,
        refNo: 'REF-001',
        createdBy: user._id,
      };

      const movement = new StockMovement(movementData);

      await expect(movement.save()).rejects.toThrow();
    });

    it('should require createdBy', async () => {
      const part = await createTestPart();

      const movementData = {
        partId: part._id,
        type: 'IN',
        quantity: 10,
        refNo: 'REF-001',
      };

      const movement = new StockMovement(movementData);

      await expect(movement.save()).rejects.toThrow();
    });
  });

  describe('StockMovement Queries', () => {
    it('should find movements by part', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      await createTestStockMovement(part._id.toString(), user._id.toString());
      await createTestStockMovement(part._id.toString(), user._id.toString(), {
        quantity: 5,
      });

      const movements = await StockMovement.find({ partId: part._id });

      expect(movements).toHaveLength(2);
      expect(movements[0].partId.toString()).toBe(part._id.toString());
      expect(movements[1].partId.toString()).toBe(part._id.toString());
    });

    it('should find movements by type', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      await createTestStockMovement(part._id.toString(), user._id.toString(), {
        type: 'IN',
      });
      await createTestStockMovement(part._id.toString(), user._id.toString(), {
        type: 'OUT',
      });

      const inMovements = await StockMovement.find({ type: 'IN' });
      const outMovements = await StockMovement.find({ type: 'OUT' });

      expect(inMovements).toHaveLength(1);
      expect(outMovements).toHaveLength(1);
      expect(inMovements[0].type).toBe('IN');
      expect(outMovements[0].type).toBe('OUT');
    });

    it('should find movements by creator', async () => {
      const user = await createTestUser();
      const part = await createTestPart();

      await createTestStockMovement(part._id.toString(), user._id.toString());
      await createTestStockMovement(part._id.toString(), user._id.toString());

      const movements = await StockMovement.find({ createdBy: user._id });

      expect(movements).toHaveLength(2);
      movements.forEach((movement) => {
        expect(movement.createdBy.toString()).toBe(user._id.toString());
      });
    });
  });
});
