import mongoose, { Schema, Document } from 'mongoose';
import { ISlotLock, TurfId } from '../types';

export interface SlotLockDocument extends Omit<ISlotLock, '_id'>, Document {}

const slotLockSchema = new Schema<SlotLockDocument>(
  {
    turfId: {
      type: String,
      enum: ['A', 'B', 'D'] as TurfId[],
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startHour: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: only one lock per slot
slotLockSchema.index({ turfId: 1, date: 1, startHour: 1 }, { unique: true });

// TTL index: auto-delete expired locks
slotLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SlotLock = mongoose.model<SlotLockDocument>('SlotLock', slotLockSchema);
