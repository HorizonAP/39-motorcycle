import { describe, it, expect, beforeEach } from 'vitest';
import { Part } from '../../models/Part';
import { createTestPart } from '../fixtures';

describe('Part Model', () => {
  beforeEach(async () => {
    // Database is cleared in global setup
  });

  describe('Part Creation', () => {
    it('should create a part with valid data', async () => {
      const partData = {
        sku: 'BRK-001',
        name: 'Brake Pad Front',
        description: 'High-quality brake pad',
        unitPrice: 45.99,
        qtyAvailable: 25,
        minStockLevel: 10,
        category: 'Brakes',
        brand: 'Brembo',
      };

      const part = new Part(partData);
      const savedPart = await part.save();

      expect(savedPart.sku).toBe(partData.sku);
      expect(savedPart.name).toBe(partData.name);
      expect(savedPart.unitPrice).toBe(partData.unitPrice);
      expect(savedPart.qtyAvailable).toBe(partData.qtyAvailable);
      expect(savedPart.minStockLevel).toBe(partData.minStockLevel);
    });

    it('should set default values correctly', async () => {
      const partData = {
        sku: 'TEST-001',
        name: 'Test Part',
        unitPrice: 10.99,
      };

      const part = new Part(partData);
      const savedPart = await part.save();

      expect(savedPart.qtyAvailable).toBe(0);
      expect(savedPart.minStockLevel).toBe(5);
    });
  });

  describe('Part Validation', () => {
    it('should require SKU', async () => {
      const partData = {
        name: 'Test Part',
        unitPrice: 10.99,
      };

      const part = new Part(partData);

      await expect(part.save()).rejects.toThrow();
    });

    it('should require name', async () => {
      const partData = {
        sku: 'TEST-001',
        unitPrice: 10.99,
      };

      const part = new Part(partData);

      await expect(part.save()).rejects.toThrow();
    });

    it('should require unit price', async () => {
      const partData = {
        sku: 'TEST-001',
        name: 'Test Part',
      };

      const part = new Part(partData);

      await expect(part.save()).rejects.toThrow();
    });

    it('should require unique SKU', async () => {
      await createTestPart({ sku: 'DUPLICATE-SKU' });

      const duplicatePart = {
        sku: 'DUPLICATE-SKU',
        name: 'Another Part',
        unitPrice: 20.99,
      };

      const part = new Part(duplicatePart);

      await expect(part.save()).rejects.toThrow();
    });

    it('should not allow negative unit price', async () => {
      const partData = {
        sku: 'TEST-001',
        name: 'Test Part',
        unitPrice: -10.99,
      };

      const part = new Part(partData);

      await expect(part.save()).rejects.toThrow();
    });

    it('should not allow negative quantity', async () => {
      const partData = {
        sku: 'TEST-001',
        name: 'Test Part',
        unitPrice: 10.99,
        qtyAvailable: -5,
      };

      const part = new Part(partData);

      await expect(part.save()).rejects.toThrow();
    });

    it('should not allow negative minimum stock level', async () => {
      const partData = {
        sku: 'TEST-001',
        name: 'Test Part',
        unitPrice: 10.99,
        minStockLevel: -1,
      };

      const part = new Part(partData);

      await expect(part.save()).rejects.toThrow();
    });
  });

  describe('Part Queries', () => {
    it('should find parts by SKU', async () => {
      const testPart = await createTestPart({ sku: 'FIND-ME-001' });

      const foundPart = await Part.findOne({ sku: 'FIND-ME-001' });

      expect(foundPart).toBeDefined();
      expect(foundPart!.name).toBe(testPart.name);
    });

    it('should find low stock parts', async () => {
      await createTestPart({
        sku: 'LOW-STOCK-001',
        qtyAvailable: 2,
        minStockLevel: 5,
      });
      await createTestPart({
        sku: 'GOOD-STOCK-001',
        qtyAvailable: 10,
        minStockLevel: 5,
      });

      const lowStockParts = await Part.find({
        $expr: { $lte: ['$qtyAvailable', '$minStockLevel'] },
      });

      expect(lowStockParts).toHaveLength(1);
      expect(lowStockParts[0].sku).toBe('LOW-STOCK-001');
    });
  });

  describe('Stock Calculations', () => {
    it('should calculate total stock value correctly', async () => {
      const parts = await Promise.all([
        createTestPart({
          sku: 'VAL-001',
          name: 'Part 1',
          unitPrice: 10.5,
          qtyAvailable: 5,
        }),
        createTestPart({
          sku: 'VAL-002',
          name: 'Part 2',
          unitPrice: 25.99,
          qtyAvailable: 3,
        }),
        createTestPart({
          sku: 'VAL-003',
          name: 'Part 3',
          unitPrice: 15.0,
          qtyAvailable: 0,
        }),
      ]);

      // Calculate total stock value
      const stockValue = await Part.aggregate([
        {
          $project: {
            value: { $multiply: ['$unitPrice', '$qtyAvailable'] },
          },
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$value' },
          },
        },
      ]);

      const expectedValue = 10.5 * 5 + 25.99 * 3 + 15.0 * 0;
      expect(stockValue[0].totalValue).toBeCloseTo(expectedValue, 2);
    });

    it('should identify parts that need reordering', async () => {
      await Promise.all([
        createTestPart({
          sku: 'REORDER-001',
          name: 'Low Stock Part 1',
          unitPrice: 10.0,
          qtyAvailable: 2,
          minStockLevel: 5,
        }),
        createTestPart({
          sku: 'REORDER-002',
          name: 'Low Stock Part 2',
          unitPrice: 15.0,
          qtyAvailable: 0,
          minStockLevel: 3,
        }),
        createTestPart({
          sku: 'REORDER-003',
          name: 'Good Stock Part',
          unitPrice: 20.0,
          qtyAvailable: 10,
          minStockLevel: 5,
        }),
      ]);

      const reorderParts = await Part.find({
        $expr: { $lte: ['$qtyAvailable', '$minStockLevel'] },
      });

      expect(reorderParts).toHaveLength(2);

      const reorderSkus = reorderParts.map((p) => p.sku).sort();
      expect(reorderSkus).toContain('REORDER-001');
      expect(reorderSkus).toContain('REORDER-002');
    });
  });
});
