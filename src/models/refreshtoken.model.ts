// models/refreshToken.model.ts
import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
    replacedByHash: { type: String, default: null }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: true
  }
);

// TTL index: document will be removed when expiresAt < now
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
