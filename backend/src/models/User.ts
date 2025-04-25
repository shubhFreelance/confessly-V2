import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/config";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  collegeName: string;
  confessionLink: string;
  isAdmin: boolean;
  isBlocked: boolean;
  subscription: {
    tier: "basic" | "silver" | "gold" | "platinum";
    expiresAt: Date;
    messageCount: number;
    allowedColleges: string[];
  };
  stats: {
    profileVisits: number;
    totalLikes: number;
    totalConfessions: number;
    totalComments: number;
    weeklyRank: number;
    monthlyRank: number;
    activityLog: Array<{
      action: string;
      data?: any;
      timestamp: Date;
    }>;
    boostEndDate?: Date;
    boostType?: string;
  };
  preferences: {
    theme: string;
    hasPrivateVault: boolean;
    customReactions: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  role: "user" | "admin";
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateAnonId(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    collegeName: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },
    confessionLink: {
      type: String,
      unique: true,
      default: function () {
        return `${this.username}-${crypto.randomBytes(4).toString("hex")}`;
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    subscription: {
      tier: {
        type: String,
        enum: ["basic", "silver", "gold", "platinum"],
        default: "basic",
      },
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      messageCount: {
        type: Number,
        default: 0,
      },
      allowedColleges: {
        type: [String],
        default: [],
      },
    },
    stats: {
      profileVisits: {
        type: Number,
        default: 0,
      },
      totalLikes: {
        type: Number,
        default: 0,
      },
      totalConfessions: {
        type: Number,
        default: 0,
      },
      totalComments: {
        type: Number,
        default: 0,
      },
      weeklyRank: {
        type: Number,
        default: 0,
      },
      monthlyRank: {
        type: Number,
        default: 0,
      },
      activityLog: [
        {
          action: String,
          data: Schema.Types.Mixed,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      boostEndDate: Date,
      boostType: String,
    },
    preferences: {
      theme: {
        type: String,
        default: "default",
      },
      hasPrivateVault: {
        type: Boolean,
        default: false,
      },
      customReactions: {
        type: Boolean,
        default: false,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.twoFactorSecret;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Generate confession link if not set
userSchema.pre("save", function (next) {
  if (!this.confessionLink) {
    this.confessionLink = `${this.username}-${crypto
      .randomBytes(4)
      .toString("hex")}`;
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { id: this._id, role: this.role },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
};

// Generate anonymous ID
userSchema.methods.generateAnonId = function (): string {
  return `Anon_${this._id.toString().substring(0, 8)}`;
};

// Only keep compound indexes that are needed for performance
userSchema.index({ collegeName: 1 });
userSchema.index({ "stats.weeklyRank": 1 });
userSchema.index({ "stats.monthlyRank": 1 });

export const User = mongoose.model<IUser>("User", userSchema);
