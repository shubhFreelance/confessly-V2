import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { Confession } from "../models/Confession";

interface AuthRequest extends Request {
  user?: IUser;
}

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        messageCount: 0,
        allowedColleges: [collegeName],
      },
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "default-secret",
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
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Check if password is correct
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     if (user.isBlocked) {
//       return res.status(403).json({ message: 'Your account has been blocked' });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET || 'default-secret',
//       { expiresIn: '7d' }
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         collegeName: user.collegeName,
//         subscription: user.subscription
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      collegeName: user.collegeName,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { username, email, collegeName } = req.body;

    // Check if new username or email is already taken
    if (username !== user.username || email !== user.email) {
      const existingUser = await User.findOne({
        $and: [{ _id: { $ne: user._id } }, { $or: [{ email }, { username }] }],
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Username or email already taken" });
      }
    }

    // Update user
    user.username = username;
    user.email = email;
    user.collegeName = collegeName;
    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      collegeName: user.collegeName,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user account
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Block user
export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { userId } = req.params;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only admin can block users
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to block users" });
    }

    targetUser.isBlocked = true;
    await targetUser.save();

    res.json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ message: "Server error while blocking user" });
  }
};

// Unblock user
export const unblockUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { userId } = req.params;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only admin can unblock users
    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to unblock users" });
    }

    targetUser.isBlocked = false;
    await targetUser.save();

    res.json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ message: "Server error while unblocking user" });
  }
};

// Get blocked users (admin)
export const getBlockedUsers = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const blockedUsers = await User.find({ isBlocked: true }).select(
      "username email collegeName"
    );

    res.json(blockedUsers);
  } catch (error) {
    console.error("Error getting blocked users:", error);
    res
      .status(500)
      .json({ message: "Server error while getting blocked users" });
  }
};

// Get college leaderboard
export const getCollegeLeaderboard = async (req: Request, res: Response) => {
  try {
    const { collegeName } = req.params;
    const { period = "weekly" } = req.query;

    const dateFilter =
      period === "monthly"
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const leaderboard = await User.find({
      collegeName,
      createdAt: { $gte: dateFilter },
    })
      .sort({ likes: -1, confessionsReceived: -1 })
      .limit(10)
      .select("username likes confessionsReceived profileVisits");

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard", error });
  }
};

// Create super admin (first admin user)
export const createSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password, adminSecret } = req.body;

    // Verify admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid admin secret" });
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({ message: "Super admin already exists" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create super admin user
    const user = new User({
      username,
      email,
      password,
      isAdmin: true,
      collegeName: "Admin",
      subscription: {
        tier: "platinum",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        messageCount: 0,
        allowedColleges: ["*"], // All colleges allowed
      },
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Super admin created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error creating super admin:", error);
    res
      .status(500)
      .json({ message: "Server error while creating super admin" });
  }
};

// Get user's confession link
export const getConfessionLink = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ confessionLink: user.confessionLink });
  } catch (error) {
    console.error("Error getting confession link:", error);
    res
      .status(500)
      .json({ message: "Server error while getting confession link" });
  }
};

// Get profile by confession link
export const getProfileByLink = async (req: Request, res: Response) => {
  try {
    const { confessionLink } = req.params;
    const user = await User.findOne({ confessionLink });

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      username: user.username,
      collegeName: user.collegeName,
      stats: user.stats,
    });
  } catch (error) {
    console.error("Error getting profile by link:", error);
    res.status(500).json({ message: "Server error while getting profile" });
  }
};

// Get user stats
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json({
      stats: user.stats,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ message: "Server error while getting user stats" });
  }
};

// Get message count
export const getMessageCount = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const messageCount = await Confession.countDocuments({
      recipient: user._id,
    });
    res.json({ messageCount });
  } catch (error) {
    console.error("Error getting message count:", error);
    res
      .status(500)
      .json({ message: "Server error while getting message count" });
  }
};

// Get reported confessions (admin)
export const getReportedConfessions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const reportedConfessions = await Confession.find({ isReported: true })
      .populate("recipient", "username")
      .sort({ reportCount: -1 });

    res.json(reportedConfessions);
  } catch (error) {
    console.error("Error getting reported confessions:", error);
    res
      .status(500)
      .json({ message: "Server error while getting reported confessions" });
  }
};

// Get colleges list (admin)
export const getColleges = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const colleges = await User.distinct("collegeName");
    res.json(colleges);
  } catch (error) {
    console.error("Error getting colleges:", error);
    res.status(500).json({ message: "Server error while getting colleges" });
  }
};

// Get admin stats
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const totalUsers = await User.countDocuments();
    const totalConfessions = await Confession.countDocuments();
    const reportedConfessions = await Confession.countDocuments({
      isReported: true,
    });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    res.json({
      totalUsers,
      totalConfessions,
      reportedConfessions,
      blockedUsers,
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({ message: "Server error while getting admin stats" });
  }
};

// Get weekly rankings
export const getWeeklyRankings = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const rankings = await User.find({
      collegeName: user.collegeName,
      createdAt: { $gte: oneWeekAgo },
    })
      .sort({ "stats.weeklyRank": -1 })
      .select("username stats.weeklyRank stats.profileVisits");

    res.json(rankings);
  } catch (error) {
    console.error("Error getting weekly rankings:", error);
    res
      .status(500)
      .json({ message: "Server error while getting weekly rankings" });
  }
};

// Get monthly rankings
export const getMonthlyRankings = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const rankings = await User.find({
      collegeName: user.collegeName,
      createdAt: { $gte: oneMonthAgo },
    })
      .sort({ "stats.monthlyRank": -1 })
      .select("username stats.monthlyRank stats.profileVisits");

    res.json(rankings);
  } catch (error) {
    console.error("Error getting monthly rankings:", error);
    res
      .status(500)
      .json({ message: "Server error while getting monthly rankings" });
  }
};

// Get user's rankings
export const getUserRankings = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const weeklyRank =
      (await User.countDocuments({
        collegeName: user.collegeName,
        "stats.weeklyRank": { $gt: user.stats.weeklyRank },
      })) + 1;

    const monthlyRank =
      (await User.countDocuments({
        collegeName: user.collegeName,
        "stats.monthlyRank": { $gt: user.stats.monthlyRank },
      })) + 1;

    res.json({
      weeklyRank,
      monthlyRank,
      stats: user.stats,
    });
  } catch (error) {
    console.error("Error getting user rankings:", error);
    res
      .status(500)
      .json({ message: "Server error while getting user rankings" });
  }
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { tier, expiresAt } = req.body;
    user.subscription = {
      tier,
      expiresAt: new Date(expiresAt),
      messageCount: 0,
      allowedColleges: user.subscription.allowedColleges,
    };

    await user.save();
    res.json({
      message: "Subscription updated successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ message: "Error updating subscription" });
  }
};
