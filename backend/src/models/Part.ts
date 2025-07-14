import mongoose, { Schema, Document } from 'mongoose';

export interface IPart extends Document {
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  qtyAvailable: number;
  minStockLevel: number;
  category?: string;
  brand?: string;
  createdAt: Date;
  updatedAt: Date;
}

const partSchema = new Schema<IPart>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    qtyAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },
    category: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
partSchema.index({ name: 1 });

export const Part = mongoose.model<IPart>('Part', partSchema);
