import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IConfession } from './Confession';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  confession: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  likes: number;
  isReported: boolean;
  reportCount: number;
  reportReasons: string[];
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  confession: {
    type: Schema.Types.ObjectId,
    ref: 'Confession',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reportReasons: [{
    type: String
  }],
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
CommentSchema.index({ confession: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema); 