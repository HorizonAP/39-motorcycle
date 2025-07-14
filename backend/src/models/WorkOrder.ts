import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkOrder extends Document {
  workOrderNo: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    plateNumber?: string;
    mileage?: number;
  };
  laborCost: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workOrderSchema = new Schema<IWorkOrder>(
  {
    workOrderNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    vehicleInfo: {
      make: {
        type: String,
        required: true,
        trim: true,
      },
      model: {
        type: String,
        required: true,
        trim: true,
      },
      year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 1,
      },
      plateNumber: {
        type: String,
        trim: true,
        uppercase: true,
      },
      mileage: {
        type: Number,
        min: 0,
      },
    },
    laborCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
workOrderSchema.index({ 'customer.name': 1 });
workOrderSchema.index({ status: 1 });

export const WorkOrder = mongoose.model<IWorkOrder>(
  'WorkOrder',
  workOrderSchema
);
