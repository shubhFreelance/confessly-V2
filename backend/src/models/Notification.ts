import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IConfession } from './Confession';
import { IComment } from './Comment';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'comment' | 'reaction' | 'mention';
  confession?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  actor?: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['comment', 'reaction', 'mention'],
    required: true
  },
  confession: {
    type: Schema.Types.ObjectId,
    ref: 'Confession'
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  actor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema); 