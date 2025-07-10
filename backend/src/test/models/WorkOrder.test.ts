import { describe, it, expect, beforeEach } from 'vitest';
import { WorkOrder } from '../../models/WorkOrder';
import { createTestUser, createTestWorkOrder } from '../fixtures';

describe('WorkOrder Model', () => {
  beforeEach(async () => {
    // Database is cleared in global setup
  });

  describe('WorkOrder Creation', () => {
    it('should create a work order with valid data', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-001',
        customer: {
          name: 'John Smith',
          phone: '123-456-7890',
          email: 'john@example.com',
        },
        vehicleInfo: {
          make: 'Honda',
          model: 'CBR600RR',
          year: 2020,
          plateNumber: 'ABC123',
          mileage: 15000,
        },
        laborCost: 150.0,
        status: 'pending',
        notes: 'Regular maintenance',
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);
      const savedWorkOrder = await workOrder.save();

      expect(savedWorkOrder.workOrderNo).toBe(workOrderData.workOrderNo);
      expect(savedWorkOrder.customer.name).toBe(workOrderData.customer.name);
      expect(savedWorkOrder.vehicleInfo.make).toBe(
        workOrderData.vehicleInfo.make
      );
      expect(savedWorkOrder.laborCost).toBe(workOrderData.laborCost);
      expect(savedWorkOrder.status).toBe('pending');
    });

    it('should set default status to pending', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-002',
        customer: { name: 'Jane Doe' },
        vehicleInfo: { make: 'Yamaha', model: 'R1', year: 2021 },
        laborCost: 100.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);
      const savedWorkOrder = await workOrder.save();

      expect(savedWorkOrder.status).toBe('pending');
    });
  });

  describe('WorkOrder Validation', () => {
    it('should require work order number', async () => {
      const user = await createTestUser();

      const workOrderData = {
        customer: { name: 'John Doe' },
        vehicleInfo: { make: 'Honda', model: 'CBR', year: 2020 },
        laborCost: 100.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);

      await expect(workOrder.save()).rejects.toThrow();
    });

    it('should require customer name', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-003',
        customer: {},
        vehicleInfo: { make: 'Honda', model: 'CBR', year: 2020 },
        laborCost: 100.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);

      await expect(workOrder.save()).rejects.toThrow();
    });

    it('should require vehicle make', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-004',
        customer: { name: 'John Doe' },
        vehicleInfo: { model: 'CBR', year: 2020 },
        laborCost: 100.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);

      await expect(workOrder.save()).rejects.toThrow();
    });

    it('should require vehicle model', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-005',
        customer: { name: 'John Doe' },
        vehicleInfo: { make: 'Honda', year: 2020 },
        laborCost: 100.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);

      await expect(workOrder.save()).rejects.toThrow();
    });

    it('should require vehicle year', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-006',
        customer: { name: 'John Doe' },
        vehicleInfo: { make: 'Honda', model: 'CBR' },
        laborCost: 100.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);

      await expect(workOrder.save()).rejects.toThrow();
    });

    it('should validate year range', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-007',
        customer: { name: 'John Doe' },
        vehicleInfo: { make: 'Honda', model: 'CBR', year: 1800 },
        laborCost: 100.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);

      await expect(workOrder.save()).rejects.toThrow();
    });

    it('should only allow valid status values', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-008',
        customer: { name: 'John Doe' },
        vehicleInfo: { make: 'Honda', model: 'CBR', year: 2020 },
        laborCost: 100.0,
        status: 'invalid-status' as any,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);

      await expect(workOrder.save()).rejects.toThrow();
    });

    it('should not allow negative labor cost', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-009',
        customer: { name: 'John Doe' },
        vehicleInfo: { make: 'Honda', model: 'CBR', year: 2020 },
        laborCost: -50.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);

      await expect(workOrder.save()).rejects.toThrow();
    });

    it('should convert plate number to uppercase', async () => {
      const user = await createTestUser();

      const workOrderData = {
        workOrderNo: 'WO-010',
        customer: { name: 'John Doe' },
        vehicleInfo: {
          make: 'Honda',
          model: 'CBR',
          year: 2020,
          plateNumber: 'abc123',
        },
        laborCost: 100.0,
        createdBy: user._id,
      };

      const workOrder = new WorkOrder(workOrderData);
      const savedWorkOrder = await workOrder.save();

      expect(savedWorkOrder.vehicleInfo.plateNumber).toBe('ABC123');
    });
  });

  describe('WorkOrder Queries', () => {
    it('should find work orders by status', async () => {
      const user = await createTestUser();

      await createTestWorkOrder(user._id.toString(), { status: 'pending' });
      await createTestWorkOrder(user._id.toString(), {
        workOrderNo: 'WO-TEST-002',
        status: 'completed',
      });

      const pendingOrders = await WorkOrder.find({ status: 'pending' });
      const completedOrders = await WorkOrder.find({ status: 'completed' });

      expect(pendingOrders).toHaveLength(1);
      expect(completedOrders).toHaveLength(1);
    });

    it('should find work orders by customer name', async () => {
      const user = await createTestUser();

      await createTestWorkOrder(user._id.toString(), {
        customer: { name: 'Alice Johnson' },
      });

      const orders = await WorkOrder.find({ 'customer.name': 'Alice Johnson' });

      expect(orders).toHaveLength(1);
      expect(orders[0].customer.name).toBe('Alice Johnson');
    });
  });

  describe('Work Order Number Generation', () => {
    it('should generate sequential work order numbers', async () => {
      const user = await createTestUser();

      // Simulate work order number generation
      const generateWorkOrderNo = async () => {
        const count = await WorkOrder.countDocuments();
        return `WO-${String(count + 1).padStart(6, '0')}`;
      };

      const wo1No = await generateWorkOrderNo();
      const workOrder1 = new WorkOrder({
        workOrderNo: wo1No,
        customer: { name: 'Customer 1' },
        vehicleInfo: { make: 'Honda', model: 'CBR', year: 2020 },
        laborCost: 100,
        createdBy: user._id,
      });
      await workOrder1.save();

      const wo2No = await generateWorkOrderNo();
      const workOrder2 = new WorkOrder({
        workOrderNo: wo2No,
        customer: { name: 'Customer 2' },
        vehicleInfo: { make: 'Yamaha', model: 'R1', year: 2021 },
        laborCost: 150,
        createdBy: user._id,
      });
      await workOrder2.save();

      expect(wo1No).toBe('WO-000001');
      expect(wo2No).toBe('WO-000002');
    });
  });
});
