import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkOrderPart extends Document {
  workOrderId: mongoose.Types.ObjectId;
  partId: mongoose.Types.ObjectId;
  quantity: number;
  unitPriceSnapshot: number;
  createdAt: Date;
}

const workOrderPartSchema = new Schema<IWorkOrderPart>({
  workOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true
  },
  partId: {
    type: Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPriceSnapshot: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Compound index for uniqueness and faster queries
workOrderPartSchema.index({ workOrderId: 1, partId: 1 }, { unique: true });

export const WorkOrderPart = mongoose.model<IWorkOrderPart>('WorkOrderPart', workOrderPartSchema);
