import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IPromotion extends Document {
  title: string;
  content: string;
  type: 'banner' | 'promotion';
  collegeName: string;
  isActive: boolean;
  endDate: Date;
  createdBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['banner', 'promotion'],
    default: 'promotion'
  },
  collegeName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
promotionSchema.index({ collegeName: 1, endDate: 1 });
promotionSchema.index({ type: 1, isActive: 1 });

export const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema); 