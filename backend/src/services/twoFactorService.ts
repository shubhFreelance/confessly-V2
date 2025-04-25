import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';

export class TwoFactorService {
  static async generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `Confessly:${userId}`
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode
    };
  }

  static verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 step before/after for clock drift
    });
  }

  static async enable2FA(userId: string, secret: string, token: string) {
    const isValid = this.verifyToken(secret, token);
    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }

    await User.findByIdAndUpdate(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: true
    });

    return true;
  }

  static async disable2FA(userId: string, token: string) {
    const user = await User.findById(userId);
    if (!user?.twoFactorSecret) {
      throw new Error('2FA not enabled');
    }

    const isValid = this.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }

    await User.findByIdAndUpdate(userId, {
      twoFactorSecret: null,
      twoFactorEnabled: false
    });

    return true;
  }
} 