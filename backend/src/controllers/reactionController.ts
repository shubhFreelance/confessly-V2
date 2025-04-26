import { Request, Response } from 'express';
import { Confession } from '../models/Confession';
import { Like } from '../models/Like';

interface AuthRequest extends Request {
  user?: any;
}

export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { confessionId } = req.params;
    const { reaction } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const confession = await Confession.findById(confessionId);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    // Check if user has already liked this confession
    const existingLike = await Like.findOne({ user: userId, confession: confessionId });

    if (existingLike) {
      // Remove like
      await Like.deleteOne({ _id: existingLike._id });
      const currentCount = confession.reactions.get(reaction) || 0;
      if (currentCount > 0) {
        confession.reactions.set(reaction, currentCount - 1);
      }
      await confession.save();
      
      res.json({ 
        message: 'Reaction removed', 
        reactions: Object.fromEntries(confession.reactions),
        likedByUser: false
      });
    } else {
      // Add like
      const newLike = new Like({
        user: userId,
        confession: confessionId,
        collegeName: confession.collegeName
      });
      await newLike.save();

      const currentCount = confession.reactions.get(reaction) || 0;
      confession.reactions.set(reaction, currentCount + 1);
      await confession.save();
      
      res.json({ 
        message: 'Reaction added', 
        reactions: Object.fromEntries(confession.reactions),
        likedByUser: true
      });
    }
  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({ message: 'Error handling reaction' });
  }
};

export const removeReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { confessionId } = req.params;
    const { reaction } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const confession = await Confession.findById(confessionId);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    // Remove like from Like collection
    await Like.deleteOne({ user: userId, confession: confessionId });

    // Update reaction count
    const currentCount = confession.reactions.get(reaction) || 0;
    if (currentCount > 0) {
      confession.reactions.set(reaction, currentCount - 1);
      await confession.save();
    }
    
    res.json({ 
      message: 'Reaction removed', 
      reactions: Object.fromEntries(confession.reactions),
      likedByUser: false
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ message: 'Error removing reaction' });
  }
}; 