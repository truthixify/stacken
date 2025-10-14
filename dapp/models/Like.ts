import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  userAddress: string;
  targetType: 'CAMPAIGN' | 'SUBMISSION';
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userAddress: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: ['CAMPAIGN', 'SUBMISSION'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Ensure one like per user per target
LikeSchema.index({ userAddress: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for counting likes
LikeSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);
