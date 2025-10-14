import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  // Stacks wallet info
  stacksAddress: string;

  // Profile info
  username?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  bio?: string;

  // Simple social links
  socialLinks: {
    twitter?: string;
    discord?: string;
    github?: string;
    website?: string;
    telegram?: string;
  };

  // Social connections (for verification)
  socialConnections: {
    twitter?: {
      username: string;
      verified: boolean;
      connectedAt: Date;
    };
    discord?: {
      username: string;
      verified: boolean;
      connectedAt: Date;
    };
    telegram?: {
      username: string;
      verified: boolean;
      connectedAt: Date;
    };
  };

  // Points and achievements
  totalPoints: number;
  achievements: string[];

  // Mission participation
  participatedMissions: string[];
  createdMissions: string[];
  wonMissions: string[];

  // Role and permissions
  role: 'USER' | 'ADMIN';

  // Settings
  settings: {
    emailNotifications: boolean;
    publicProfile: boolean;
    showAchievements: boolean;
  };

  // Metadata
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    stacksAddress: { type: String, required: true, unique: true },

    username: { type: String, unique: true, sparse: true, maxlength: 50 },
    displayName: { type: String, maxlength: 100 },
    email: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },

    socialLinks: {
      twitter: { type: String },
      discord: { type: String },
      github: { type: String },
      website: { type: String },
      telegram: { type: String },
    },

    socialConnections: {
      twitter: {
        username: { type: String },
        verified: { type: Boolean, default: false },
        connectedAt: { type: Date },
      },
      discord: {
        username: { type: String },
        verified: { type: Boolean, default: false },
        connectedAt: { type: Date },
      },
      telegram: {
        username: { type: String },
        verified: { type: Boolean, default: false },
        connectedAt: { type: Date },
      },
    },

    totalPoints: { type: Number, default: 0 },
    achievements: [{ type: String }],

    participatedMissions: [{ type: Schema.Types.ObjectId, ref: 'Mission' }],
    createdMissions: [{ type: Schema.Types.ObjectId, ref: 'Mission' }],
    wonMissions: [{ type: Schema.Types.ObjectId, ref: 'Mission' }],

    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },

    settings: {
      emailNotifications: { type: Boolean, default: true },
      publicProfile: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true },
    },

    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Additional indexes (stacksAddress and username already have unique indexes)
UserSchema.index({ totalPoints: -1 });
UserSchema.index({ lastActiveAt: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
