import mongoose, { Schema, Document } from 'mongoose';

export interface IMission extends Document {
  // On-chain data
  missionId: number;
  missionAddress: string; // Contract address + mission ID
  creatorAddress: string;

  // Mission details
  title: string;
  summary: string; // Brief summary for cards
  description: string;
  details: string; // Rich text content with formatting
  imageUrl?: string;
  category: string;
  tags: string[];

  // Mission configuration
  tokenAddress?: string;
  tokenAmount?: number;
  totalPoints: number;

  // Time configuration
  startTime: Date;
  endTime: Date;

  // Status
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  isFinalized: boolean;

  // Metrics
  totalParticipants: number;
  pointsDistributed: number;
  tokenDistributed: number;

  // Task-specific links
  taskLinks: Array<{
    title: string;
    url: string;
    type: 'GITHUB' | 'TWITTER' | 'DISCORD' | 'WEBSITE' | 'DOCUMENT' | 'OTHER';
    required: boolean;
    description?: string;
  }>;
  // Social links
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
    telegram?: string;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema = new Schema<IMission>(
  {
    missionId: { type: Number, unique: true, sparse: true },
    missionAddress: { type: String, unique: true, sparse: true },
    creatorAddress: { type: String, required: true, index: true },

    title: { type: String, required: true, maxlength: 256 },
    summary: { type: String, required: true, maxlength: 500 },
    description: { type: String, maxlength: 2000 }, // Optional, can be derived from details
    details: { type: String, required: true, maxlength: 10000 },
    imageUrl: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],

    tokenAddress: { type: String },
    tokenAmount: { type: Number },
    totalPoints: { type: Number, required: true },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
    },
    isFinalized: { type: Boolean, default: false },

    totalParticipants: { type: Number, default: 0 },
    pointsDistributed: { type: Number, default: 0 },
    tokenDistributed: { type: Number, default: 0 },

    taskLinks: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['GITHUB', 'TWITTER', 'DISCORD', 'WEBSITE', 'DOCUMENT', 'OTHER'],
          required: true,
        },
        required: { type: Boolean, default: false },
        description: { type: String },
      },
    ],

    socialLinks: {
      twitter: { type: String },
      discord: { type: String },
      website: { type: String },
      telegram: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MissionSchema.index({ creatorAddress: 1, status: 1 });
MissionSchema.index({ status: 1, startTime: 1 });
MissionSchema.index({ category: 1, status: 1 });

export default mongoose.models.Mission || mongoose.model<IMission>('Mission', MissionSchema);
