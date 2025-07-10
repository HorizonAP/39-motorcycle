import { describe, it, expect, beforeEach } from 'vitest';
import { WorkOrderPart } from '../../models/WorkOrderPart';
import {
  createTestUser,
  createTestPart,
  createTestWorkOrder,
  createTestWorkOrderPart,
} from '../fixtures';

describe('WorkOrderPart Model', () => {
  beforeEach(async () => {
    // Database is cleared in global setup
  });

  describe('WorkOrderPart Creation', () => {
    it('should create a work order part with valid data', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPartData = {
        workOrderId: workOrder._id,
        partId: part._id,
        quantity: 2,
        unitPriceSnapshot: 29.99,
      };

      const workOrderPart = new WorkOrderPart(workOrderPartData);
      const savedWorkOrderPart = await workOrderPart.save();

      expect(savedWorkOrderPart.workOrderId.toString()).toBe(
        workOrder._id.toString()
      );
      expect(savedWorkOrderPart.partId.toString()).toBe(part._id.toString());
      expect(savedWorkOrderPart.quantity).toBe(2);
      expect(savedWorkOrderPart.unitPriceSnapshot).toBe(29.99);
      expect(savedWorkOrderPart.createdAt).toBeDefined();
    });

    it('should create a work order part using test helper', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPart = await createTestWorkOrderPart(
        workOrder._id.toString(),
        part._id.toString()
      );

      expect(workOrderPart.workOrderId.toString()).toBe(
        workOrder._id.toString()
      );
      expect(workOrderPart.partId.toString()).toBe(part._id.toString());
      expect(workOrderPart.quantity).toBe(2);
      expect(workOrderPart.unitPriceSnapshot).toBe(29.99);
    });

    it('should handle different quantities and prices', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPart = await createTestWorkOrderPart(
        workOrder._id.toString(),
        part._id.toString(),
        { quantity: 5, unitPriceSnapshot: 99.99 }
      );

      expect(workOrderPart.quantity).toBe(5);
      expect(workOrderPart.unitPriceSnapshot).toBe(99.99);
    });
  });

  describe('WorkOrderPart Validation', () => {
    it('should require workOrderId', async () => {
      const part = await createTestPart();

      const workOrderPartData = {
        partId: part._id,
        quantity: 2,
        unitPriceSnapshot: 29.99,
      };

      const workOrderPart = new WorkOrderPart(workOrderPartData);

      await expect(workOrderPart.save()).rejects.toThrow();
    });

    it('should require partId', async () => {
      const user = await createTestUser();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPartData = {
        workOrderId: workOrder._id,
        quantity: 2,
        unitPriceSnapshot: 29.99,
      };

      const workOrderPart = new WorkOrderPart(workOrderPartData);

      await expect(workOrderPart.save()).rejects.toThrow();
    });

    it('should require quantity', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPartData = {
        workOrderId: workOrder._id,
        partId: part._id,
        unitPriceSnapshot: 29.99,
      };

      const workOrderPart = new WorkOrderPart(workOrderPartData);

      await expect(workOrderPart.save()).rejects.toThrow();
    });

    it('should require unitPriceSnapshot', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPartData = {
        workOrderId: workOrder._id,
        partId: part._id,
        quantity: 2,
      };

      const workOrderPart = new WorkOrderPart(workOrderPartData);

      await expect(workOrderPart.save()).rejects.toThrow();
    });

    it('should require positive quantity', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPartData = {
        workOrderId: workOrder._id,
        partId: part._id,
        quantity: -1,
        unitPriceSnapshot: 29.99,
      };

      const workOrderPart = new WorkOrderPart(workOrderPartData);

      await expect(workOrderPart.save()).rejects.toThrow();
    });

    it('should require positive unitPriceSnapshot', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPartData = {
        workOrderId: workOrder._id,
        partId: part._id,
        quantity: 2,
        unitPriceSnapshot: -10.0,
      };

      const workOrderPart = new WorkOrderPart(workOrderPartData);

      await expect(workOrderPart.save()).rejects.toThrow();
    });
  });

  describe('WorkOrderPart Calculations', () => {
    it('should calculate total price correctly', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPart = await createTestWorkOrderPart(
        workOrder._id.toString(),
        part._id.toString(),
        { quantity: 3, unitPriceSnapshot: 25.5 }
      );

      const totalPrice =
        workOrderPart.quantity * workOrderPart.unitPriceSnapshot;
      expect(totalPrice).toBe(76.5);
    });
  });

  describe('WorkOrderPart Queries', () => {
    it('should find parts by work order', async () => {
      const user = await createTestUser();
      const part1 = await createTestPart();
      const part2 = await createTestPart({ sku: 'TEST-2' });
      const workOrder = await createTestWorkOrder(user._id.toString());

      await createTestWorkOrderPart(
        workOrder._id.toString(),
        part1._id.toString()
      );
      await createTestWorkOrderPart(
        workOrder._id.toString(),
        part2._id.toString()
      );

      const workOrderParts = await WorkOrderPart.find({
        workOrderId: workOrder._id,
      });

      expect(workOrderParts).toHaveLength(2);
      expect(workOrderParts[0].workOrderId.toString()).toBe(
        workOrder._id.toString()
      );
      expect(workOrderParts[1].workOrderId.toString()).toBe(
        workOrder._id.toString()
      );
    });

    it('should find work orders by part', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder1 = await createTestWorkOrder(user._id.toString());
      const workOrder2 = await createTestWorkOrder(user._id.toString(), {
        workOrderNo: 'WO-TEST-2',
      });

      await createTestWorkOrderPart(
        workOrder1._id.toString(),
        part._id.toString()
      );
      await createTestWorkOrderPart(
        workOrder2._id.toString(),
        part._id.toString()
      );

      const workOrderParts = await WorkOrderPart.find({ partId: part._id });

      expect(workOrderParts).toHaveLength(2);
      expect(workOrderParts[0].partId.toString()).toBe(part._id.toString());
      expect(workOrderParts[1].partId.toString()).toBe(part._id.toString());
    });

    it('should populate work order and part data', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      await createTestWorkOrderPart(
        workOrder._id.toString(),
        part._id.toString()
      );

      const workOrderPart = await WorkOrderPart.findOne({
        workOrderId: workOrder._id,
      })
        .populate('workOrderId')
        .populate('partId');

      expect(workOrderPart).toBeDefined();
      expect(workOrderPart?.workOrderId).toBeDefined();
      expect(workOrderPart?.partId).toBeDefined();
    });
  });

  describe('WorkOrderPart Updates', () => {
    it('should update quantity', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPart = await createTestWorkOrderPart(
        workOrder._id.toString(),
        part._id.toString()
      );

      workOrderPart.quantity = 5;
      await workOrderPart.save();

      const updatedWorkOrderPart = await WorkOrderPart.findById(
        workOrderPart._id
      );
      expect(updatedWorkOrderPart?.quantity).toBe(5);
    });

    it('should update unit price snapshot', async () => {
      const user = await createTestUser();
      const part = await createTestPart();
      const workOrder = await createTestWorkOrder(user._id.toString());

      const workOrderPart = await createTestWorkOrderPart(
        workOrder._id.toString(),
        part._id.toString()
      );

      workOrderPart.unitPriceSnapshot = 49.99;
      await workOrderPart.save();

      const updatedWorkOrderPart = await WorkOrderPart.findById(
        workOrderPart._id
      );
      expect(updatedWorkOrderPart?.unitPriceSnapshot).toBe(49.99);
    });
  });
});
