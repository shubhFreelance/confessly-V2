import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Confession, IConfession } from "../models/Confession";
import { User, IUser } from "../models/User";
import { Notification } from "../models/Notification";
import { profanityFilter } from "../utils/profanityFilter"; // We'll create this later
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: IUser;
}

// Create a new confession
export const createConfession = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { content, collegeName, isAnonymous } = req.body;

    // Fetch the full user document from database if needed
    // (only if req.user doesn't have username yet)
    let fullUser = user;
    console.log("User in createConfession:", user);
    if (!user.username) {
      fullUser = await User.findById(user._id).select("username");
      if (!fullUser) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    const confession = new Confession({
      content,
      recipient: {
        _id: fullUser._id,
        username: fullUser.username,
      },
      collegeName,
      isAnonymous: isAnonymous || false,
    });

    await confession.save();

    res.status(201).json({
      _id: confession._id,
      content: confession.content,
      recipient: confession.recipient, // now contains _id and username
      likes: confession.likes,
      reactions: Object.fromEntries(confession.reactions),
      collegeName: confession.collegeName,
      createdAt: confession.createdAt,
      isAnonymous: confession.isAnonymous,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get confessions with pagination and filters
export const getConfessions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const collegeName = req.query.collegeName as string;
    const skip = (page - 1) * limit;

    const query = collegeName ? { collegeName } : {};

    const confessions = await Confession.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username")
      .populate({
        path: "comments",
        select: "content author isAnonymous createdAt",
        populate: {
          path: "author",
          select: "username",
        },
      });

    const total = await Confession.countDocuments(query);

    res.json({
      confessions: confessions.map((confession) => ({
        id: confession._id,
        content: confession.content,
        author:
          confession.isAnonymous || !confession.author
            ? "Anonymous"
            : "username" in confession.author
            ? confession.author.username
            : "Unknown",
        collegeName: confession.collegeName,
        likes: confession.likes,
        dislikes: confession.dislikes,
        comments: confession.comments,
        createdAt: confession.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalConfessions: total,
      },
    });
  } catch (error) {
    console.error("Get confessions error:", error);
    res.status(500).json({ message: "Error fetching confessions" });
  }
};

// Get a specific confession
export const getConfession = async (req: Request, res: Response) => {
  try {
    const confession = await Confession.findById(req.params.id).populate<{
      recipient: IUser;
    }>("recipient", "username");

    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    const recipientDoc = confession.recipient as IUser;

    res.json({
      _id: confession._id,
      content: confession.content,
      recipient: recipientDoc.username,
      likes: confession.likes,
      reactions: Object.fromEntries(confession.reactions),
      isHidden: confession.isHidden,
      collegeName: confession.collegeName,
      createdAt: confession.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all confessions
export const getAllConfessions = async (req: Request, res: Response) => {
  try {
    const confessions = await Confession.find({ isHidden: false })
      .populate<{ recipient: IUser }>("recipient", "username")
      .sort({ createdAt: -1 });

    const formattedConfessions = confessions.map((confession) => {
      const recipientDoc = confession.recipient as IUser;
      return {
        _id: confession._id,
        content: confession.content,
        recipient: recipientDoc.username,
        likes: confession.likes,
        reactions: Object.fromEntries(confession.reactions),
        collegeName: confession.collegeName,
        createdAt: confession.createdAt,
      };
    });

    res.json(formattedConfessions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a confession
export const deleteConfession = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // Check if user is the recipient or an admin
    if (
      confession.recipient.toString() === user._id.toString() ||
      user.isAdmin
    ) {
      await Confession.deleteOne({ _id: confession._id });
      res.json({ message: "Confession deleted successfully" });
    } else {
      res
        .status(403)
        .json({ message: "Not authorized to delete this confession" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add reaction to confession
export const addReaction = async (req: Request, res: Response) => {
  try {
    const { reaction } = req.body;
    const confession = await Confession.findById(req.params.id);

    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // Initialize reactions Map if it doesn't exist
    if (!confession.reactions) {
      confession.reactions = new Map<string, number>();
    }

    // Update the reaction count
    const currentCount = confession.reactions.get(reaction) || 0;
    confession.reactions.set(reaction, currentCount + 1);
    await confession.save();

    res.json({
      message: "Reaction added successfully",
      reactions: Object.fromEntries(confession.reactions),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// React to a confession
export const reactToConfession = async (req: AuthRequest, res: Response) => {
  try {
    const { confessionId } = req.params;
    const { reaction } = req.body;

    const confession = await Confession.findById(confessionId);
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // Update reaction count
    const currentCount = confession.reactions.get(reaction) || 0;
    confession.reactions.set(reaction, currentCount + 1);
    await confession.save();

    // Create notification
    const notification = new Notification({
      recipient: confession.recipient,
      type: "reaction",
      confession: confession._id,
      actor: req.user?._id,
      message: `Someone reacted to your confession with ${reaction}`,
    });

    await notification.save();

    res.json({
      message: "Reaction added successfully",
      reactions: confession.reactions,
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ message: "Server error while adding reaction" });
  }
};

// Report a confession
export const reportConfession = async (req: AuthRequest, res: Response) => {
  try {
    const { confessionId } = req.params;
    const { reason } = req.body;

    const confession = await Confession.findById(confessionId);
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    confession.isReported = true;
    confession.reportCount += 1;
    confession.reportReasons.push(reason);

    // Auto-hide if report count exceeds threshold
    if (confession.reportCount >= 5) {
      confession.isHidden = true;
    }

    await confession.save();

    res.json({
      message: "Confession reported successfully",
      isHidden: confession.isHidden,
    });
  } catch (error) {
    console.error("Error reporting confession:", error);
    res
      .status(500)
      .json({ message: "Server error while reporting confession" });
  }
};

// Get trending confessions
export const getTrendingConfessions = async (req: Request, res: Response) => {
  try {
    const { collegeName } = req.params;
    const { timeframe = "24h" } = req.query;

    const dateFilter = new Date();
    switch (timeframe) {
      case "24h":
        dateFilter.setHours(dateFilter.getHours() - 24);
        break;
      case "7d":
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case "30d":
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      default:
        dateFilter.setHours(dateFilter.getHours() - 24);
    }

    const confessions = await Confession.find({
      collegeName,
      createdAt: { $gte: dateFilter },
      isHidden: false,
      isReported: false,
    })
      .sort({ likes: -1 })
      .limit(20)
      .populate("recipient", "username");

    res.json(confessions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching trending confessions", error });
  }
};

export const updateConfession = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authorized" });

    const { id } = req.params;
    const confession = await Confession.findById(id);
    if (!confession)
      return res.status(404).json({ message: "Confession not found" });

    if (
      !confession.author ||
      confession.author.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this confession" });
    }

    const { content } = req.body;
    confession.content = content;
    await confession.save();

    res.json({ message: "Confession updated successfully", confession });
  } catch (error) {
    console.error("Error updating confession:", error);
    res.status(500).json({ message: "Error updating confession" });
  }
};
