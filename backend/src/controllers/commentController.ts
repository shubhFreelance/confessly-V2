import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Comment, IComment } from '../models/Comment';
import { User, IUser } from '../models/User';
import { Confession } from '../models/Confession';
import { Notification } from '../models/Notification';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: IUser;
}

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { content, confessionId, isAnonymous } = req.body;

    const confession = await Confession.findById(confessionId);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    const comment = new Comment({
      content,
      author: user._id,
      confession: confessionId,
      isAnonymous
    });

    await comment.save();

    // Update confession with new comment
    await Confession.findByIdAndUpdate(confessionId, {
      $push: { comments: comment._id }
    });

    await comment.populate<{ author: IUser }>('author', 'username');
    const authorDoc = comment.author as IUser;

    res.status(201).json({
      _id: comment._id,
      content: comment.content,
      author: comment.isAnonymous ? 'Anonymous' : authorDoc.username,
      confession: comment.confession,
      likes: comment.likes,
      createdAt: comment.createdAt
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const confessionId = req.params.confessionId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ confession: confessionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username');

    const total = await Comment.countDocuments({ confession: confessionId });

    res.json({
      comments: comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        author: comment.isAnonymous ? 'Anonymous' : ('username' in comment.author ? comment.author.username : 'Unknown'),
        likes: comment.likes,
        createdAt: comment.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = content;
    await comment.save();

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error while updating comment' });
  }
};

export const getComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate<{ author: IUser }>('author', 'username');
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAnonymous = comment.isAnonymous;
    const authorDoc = comment.author as IUser;
    
    res.json({
      _id: comment._id,
      content: comment.content,
      author: isAnonymous ? 'Anonymous' : authorDoc.username,
      confession: comment.confession,
      likes: comment.likes,
      createdAt: comment.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConfessionComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ confession: req.params.confessionId })
      .populate<{ author: IUser }>('author', 'username')
      .sort({ createdAt: -1 });

    const formattedComments = comments.map(comment => {
      const authorDoc = comment.author as IUser;
      return {
        _id: comment._id,
        content: comment.content,
        author: comment.isAnonymous ? 'Anonymous' : authorDoc.username,
        confession: comment.confession,
        likes: comment.likes,
        createdAt: comment.createdAt
      };
    });

    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author or an admin
    if (comment.author.toString() === user._id.toString() || user.isAdmin) {
      await Comment.deleteOne({ _id: comment._id });
      res.json({ message: 'Comment deleted successfully' });
    } else {
      res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const reportComment = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Update comment with report information
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: { isReported: true },
        $inc: { reportCount: 1 },
        $push: { reportReasons: reason }
      },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // If report count exceeds threshold, hide the comment
    if (updatedComment.reportCount >= 3) {
      updatedComment.isHidden = true;
      await updatedComment.save();
    }

    res.json({
      message: 'Comment reported successfully',
      isHidden: updatedComment.isHidden
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 