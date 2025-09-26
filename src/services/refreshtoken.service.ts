import { RefreshToken } from "../models/refreshtoken.model" 
import { hashToken } from "../untils/token"

export const refreshTokenService = {
  save: async (plainToken: string, userId: string, email: string, ip?: string, deviceInfo?: string) => {
    const tokenHash = hashToken(plainToken);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.EXPIRES_REFRESHTOKEN as string)) * 1000);
    return RefreshToken.create({ 
      tokenHash,
      userId,
      email,
      ipAddress: ip,
      deviceInfo,
      expiresAt 
    });
  },

  findByToken: async (plainToken: string) => {
    const tokenHash = hashToken(plainToken);
    return await RefreshToken.findOne({ tokenHash }).lean();
  },

  exists: async (plainToken: string) => {
    const tokenHash = hashToken(plainToken);
    const rec = await RefreshToken.findOne({ tokenHash, revoked: false });
    return rec != null;
  },
  revokeByToken: async (plainToken: string) => {
    const tokenHash = hashToken(plainToken);
    const result = await RefreshToken.updateOne({ tokenHash,revoked: false }, { revoked: true, revokedAt: new Date() });
    return result;
  },

  revokeAllForUser: (userId: string) => {
    return RefreshToken.updateMany({ userId }, { revoked: true, revokedAt: new Date() });
  },
  // Helpers
  deleteAll: async() => { return RefreshToken.deleteMany({}); },
  getAll: async() => { return RefreshToken.find({}); }
}
