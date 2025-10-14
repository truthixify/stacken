import mongoose, { Schema, Document } from 'mongoose';

export interface IAllowedToken extends Document {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AllowedTokenSchema = new Schema(
  {
    contractAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    decimals: {
      type: Number,
      required: true,
      default: 6,
    },
    description: String,
    logoUrl: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active tokens
AllowedTokenSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.models.AllowedToken ||
  mongoose.model<IAllowedToken>('AllowedToken', AllowedTokenSchema);
