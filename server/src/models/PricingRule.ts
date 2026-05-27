import mongoose, { Schema, Document } from 'mongoose';
import { IPricingRule } from '../types';

export interface PricingRuleDocument extends Omit<IPricingRule, '_id'>, Document {}

const pricingRuleSchema = new Schema<PricingRuleDocument>(
  {
    turfId: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
      default: 'A', // Fallback for existing documents without it
    },
    dayType: {
      type: String,
      enum: ['weekday', 'weekend'],
      required: true,
    },
    startHour: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    },
    endHour: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
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
  {
    timestamps: true,
  }
);

export const PricingRule = mongoose.model<PricingRuleDocument>('PricingRule', pricingRuleSchema);
