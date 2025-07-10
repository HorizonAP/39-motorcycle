import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Part } from '../models/Part';
import { WorkOrder } from '../models/WorkOrder';
import { StockMovement } from '../models/StockMovement';
import { WorkOrderPart } from '../models/WorkOrderPart';
import type { Document } from 'mongoose';

interface UserDocument extends Document {
  _id: any;
  name: string;
  email: string;
  role: string;
  passwordHash: string;
}

interface PartDocument extends Document {
  _id: any;
  sku: string;
  name: string;
  unitPrice: number;
  qtyAvailable: number;
}

interface WorkOrderDocument extends Document {
  _id: any;
  workOrderNo: string;
  customer: any;
  vehicleInfo: any;
  laborCost: number;
  status: string;
  createdBy: any;
}

export const createTestUser = async (
  overrides: any = {}
): Promise<UserDocument> => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@workshop.com',
    passwordHash: await bcrypt.hash('password123', 10),
    role: 'user',
  };

  const user = new User({ ...defaultUser, ...overrides });
  await user.save();
  return user as UserDocument;
};

export const createTestAdmin = async (
  overrides: any = {}
): Promise<UserDocument> => {
  const defaultAdmin = {
    name: 'Admin User',
    email: 'admin@workshop.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    role: 'admin',
  };

  const admin = new User({ ...defaultAdmin, ...overrides });
  await admin.save();
  return admin as UserDocument;
};

export const createTestPart = async (
  overrides: any = {}
): Promise<PartDocument> => {
  const defaultPart = {
    sku: `TEST-${Date.now()}`,
    name: 'Test Brake Pad',
    description: 'Test brake pad for testing',
    unitPrice: 29.99,
    qtyAvailable: 10,
    minStockLevel: 5,
    category: 'Brakes',
    brand: 'TestBrand',
  };

  const part = new Part({ ...defaultPart, ...overrides });
  await part.save();
  return part as PartDocument;
};

export const createTestWorkOrder = async (
  userId: string,
  overrides: any = {}
): Promise<WorkOrderDocument> => {
  const defaultWorkOrder = {
    workOrderNo: `WO-TEST-${Date.now()}`,
    customer: {
      name: 'John Doe',
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
    laborCost: 100.0,
    status: 'pending',
    notes: 'Test work order',
    createdBy: userId,
  };

  const workOrder = new WorkOrder({ ...defaultWorkOrder, ...overrides });
  await workOrder.save();
  return workOrder as WorkOrderDocument;
};

export const createTestStockMovement = async (
  partId: string,
  userId: string,
  overrides: any = {}
) => {
  const defaultMovement = {
    partId,
    type: 'IN',
    quantity: 10,
    refNo: `TEST-REF-${Date.now()}`,
    notes: 'Test stock movement',
    createdBy: userId,
  };

  const movement = new StockMovement({ ...defaultMovement, ...overrides });
  await movement.save();
  return movement;
};

export const createTestWorkOrderPart = async (
  workOrderId: string,
  partId: string,
  overrides: any = {}
) => {
  const defaultWorkOrderPart = {
    workOrderId,
    partId,
    quantity: 2,
    unitPriceSnapshot: 29.99,
  };

  const workOrderPart = new WorkOrderPart({
    ...defaultWorkOrderPart,
    ...overrides,
  });
  await workOrderPart.save();
  return workOrderPart;
};
