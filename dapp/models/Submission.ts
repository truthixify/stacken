import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  campaignId: mongoose.Types.ObjectId;
  userAddress: string;

  // Submission content
  submissionType: 'LINK' | 'TEXT' | 'FILE' | 'SOCIAL_PROOF';
  content: {
    url?: string;
    text?: string;
    fileUrl?: string;
    socialHandle?: string;
    description?: string;
  };

  // Metadata
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  pointsAwarded: number;

  // Review info
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Timestamps
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    userAddress: { type: String, required: true, index: true },

    submissionType: {
      type: String,
      enum: ['LINK', 'TEXT', 'FILE', 'SOCIAL_PROOF'],
      required: true,
    },

    content: {
      url: { type: String },
      text: { type: String, maxlength: 2000 },
      fileUrl: { type: String },
      socialHandle: { type: String },
      description: { type: String, maxlength: 1000 },
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'],
      default: 'PENDING',
    },
    pointsAwarded: { type: Number, default: 0 },

    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    reviewNotes: { type: String, maxlength: 500 },

    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubmissionSchema.index({ campaignId: 1, userAddress: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ submittedAt: -1 });

// Ensure one submission per user per campaign
SubmissionSchema.index({ campaignId: 1, userAddress: 1 }, { unique: true });

export default mongoose.models.Submission ||
  mongoose.model<ISubmission>('Submission', SubmissionSchema);
