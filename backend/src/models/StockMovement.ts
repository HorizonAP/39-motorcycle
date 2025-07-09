import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovement extends Document {
  partId: mongoose.Types.ObjectId;
  type: 'IN' | 'OUT';
  quantity: number;
  refNo: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>({
  partId: {
    type: Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  type: {
    type: String,
    enum: ['IN', 'OUT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  refNo: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for faster queries
stockMovementSchema.index({ partId: 1, createdAt: -1 });

export const StockMovement = mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
