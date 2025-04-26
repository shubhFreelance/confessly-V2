import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { logger } from "../config/logger";
import { UnauthorizedError, BadRequestError } from "../utils/errors";

export class AuthService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key";
  private static readonly ACCESS_TOKEN_EXPIRY = "15m";
  private static readonly REFRESH_TOKEN_EXPIRY = "7d";

  static async register(userData: {
    username: string;
    email: string;
    password: string;
    collegeName: string;
  }) {
    try {
      // 1. Validate required fields
      if (!userData.email?.trim()) {
        throw new BadRequestError("Email is required.");
      }

      // 2. Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new BadRequestError("Invalid email format.");
      }

      // 3. Rest of your logic...
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new BadRequestError("Email already in use.");
      }

      const user = new User(userData);
      await user.save(); // Now Mongoose won't throw "Path `email` is required"

      return {
        user: this.sanitizeUser(user),
        ...this.generateTokens(user._id.toString()),
      };
    } catch (error) {
      logger.error("Registration error:", error);
      throw error; // Re-throw for the controller to handle
    }
  }

  // static async login(email: string, password: string) {
  //   try {
  //     // Find user
  //     const user = await User.findOne({ email });
  //     if (!user) {
  //       throw new UnauthorizedError("Invalid credentials");
  //     }

  //     // Check password
  //     const isValidPassword = await user.comparePassword(password);
  //     if (!isValidPassword) {
  //       throw new UnauthorizedError("Invalid credentials");
  //     }

  //     // Generate tokens
  //     const tokens = this.generateTokens(user._id.toString());

  //     // Update last login
  //     user.lastLogin = new Date();
  //     await user.save();

  //     return {
  //       user: this.sanitizeUser(user),
  //       ...tokens,
  //     };
  //   } catch (error) {
  //     logger.error("Error in login:", error);
  //     throw error;
  //   }
  // }

  static async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as {
        userId: string;
      };

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Generate new tokens
      const tokens = this.generateTokens(user._id.toString());

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      logger.error("Error in refreshToken:", error);
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new UnauthorizedError("Current password is incorrect");
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Generate new tokens
      const tokens = this.generateTokens(user._id.toString());

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      logger.error("Error in changePassword:", error);
      throw error;
    }
  }

  static async resetPassword(email: string) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new BadRequestError("User not found");
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id.toString() },
        this.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Store reset token
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // TODO: Send reset password email
      logger.info(`Password reset token generated for user ${user._id}`);

      return { message: "Password reset instructions sent to your email" };
    } catch (error) {
      logger.error("Error in resetPassword:", error);
      throw error;
    }
  }

  static async verifyResetToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (
        !user ||
        !user.resetPasswordToken ||
        !user.resetPasswordExpires ||
        user.resetPasswordToken !== token ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new UnauthorizedError("Invalid or expired reset token");
      }

      return user;
    } catch (error) {
      logger.error("Error in verifyResetToken:", error);
      throw new UnauthorizedError("Invalid or expired reset token");
    }
  }

  private static generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign({ userId }, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  private static sanitizeUser(user: any) {
    const sanitized = user.toObject();
    delete sanitized.password;
    delete sanitized.resetPasswordToken;
    delete sanitized.resetPasswordExpires;
    return sanitized;
  }
}
