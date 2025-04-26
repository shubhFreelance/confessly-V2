import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config/config";
import { body } from "express-validator";

interface AuthRequest extends Request {
  user?: any;
}

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, collegeName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      collegeName,
      subscription: {
        tier: "basic",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        messageCount: 0,
        allowedColleges: [collegeName],
      },
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        collegeName: user.collegeName,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  console.log("Login request");
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: "Your account is blocked. Please contact support." });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    // Send response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        collegeName: user.collegeName,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
      id: string;
    };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "Server error while changing password" });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: "1h",
    });

    // TODO: Send reset token via email
    // For now, just return the token
    res.json({ message: "Reset token generated", resetToken });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};

// Verify reset token
export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Token is valid", userId: user._id });
  } catch (error) {
    console.error("Error in verifyResetToken:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Validation middleware
export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email").trim().isEmail().withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("collegeName").trim().notEmpty().withMessage("College name is required"),
];

export const loginValidation = [
  body("email").trim().isEmail().withMessage("Must be a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

export const resetPasswordValidation = [
  body("email").trim().isEmail().withMessage("Must be a valid email address"),
];
