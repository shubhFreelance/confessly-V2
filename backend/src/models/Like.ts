import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  confession: mongoose.Types.ObjectId;
  collegeName: string;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  confession: {
    type: Schema.Types.ObjectId,
    ref: 'Confession',
    required: true
  },
  collegeName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only like a confession once
likeSchema.index({ user: 1, confession: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', likeSchema); 