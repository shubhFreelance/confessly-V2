import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IConfession extends Document {
  recipient: mongoose.Types.ObjectId | IUser;
  content: string;
  likes: number;
  dislikes: number;
  comments: mongoose.Types.ObjectId[];
  reactions: Map<string, number>;
  isHidden: boolean;
  isReported: boolean;
  reportCount: number;
  reportReasons: string[];
  collegeName: string;
  isAnonymous: boolean;
  author?: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const confessionSchema = new Schema<IConfession>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  reactions: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  isHidden: {
    type: Boolean,
    default: false
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
  collegeName: {
    type: String,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      if (ret.reactions) {
        ret.reactions = Object.fromEntries(ret.reactions);
      }
      return ret;
    }
  }
});

// Index for efficient querying
confessionSchema.index({ recipient: 1, createdAt: -1 });
confessionSchema.index({ collegeName: 1, likes: -1 });

export const Confession = mongoose.model<IConfession>('Confession', confessionSchema); 