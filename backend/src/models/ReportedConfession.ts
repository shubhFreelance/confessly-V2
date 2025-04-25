import mongoose, { Document, Schema } from 'mongoose';

export interface IReportedConfession extends Document {
  confession: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  collegeName: string;
  adminNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportedConfessionSchema = new Schema<IReportedConfession>({
  confession: {
    type: Schema.Types.ObjectId,
    ref: 'Confession',
    required: true
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  collegeName: {
    type: String,
    required: true
  },
  adminNotes: {
    type: String
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
reportedConfessionSchema.index({ collegeName: 1, status: 1 });
reportedConfessionSchema.index({ confession: 1 });
reportedConfessionSchema.index({ reportedBy: 1 });

export const ReportedConfession = mongoose.model<IReportedConfession>('ReportedConfession', reportedConfessionSchema); 