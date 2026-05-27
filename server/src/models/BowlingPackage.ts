import mongoose, { Schema, Document } from 'mongoose';

export interface IBowlingPackage {
  _id: string;
  overs: number;      // 5, 10, 15, 20
  price: number;      // total price for this package
  isActive: boolean;
}

export interface BowlingPackageDocument extends Omit<IBowlingPackage, '_id'>, Document {}

const bowlingPackageSchema = new Schema<BowlingPackageDocument>(
  {
    overs: {
      type: Number,
      enum: [5, 10, 15, 20],
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const BowlingPackage = mongoose.model<BowlingPackageDocument>('BowlingPackage', bowlingPackageSchema);
