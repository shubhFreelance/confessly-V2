import { Request, Response } from 'express';
import { Confession } from '../models/Confession';

interface AuthRequest extends Request {
  user?: any;
}

export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { confessionId } = req.params;
    const { reaction } = req.body;
    const confession = await Confession.findById(confessionId);
    
    if (!confession) return res.status(404).json({ message: 'Confession not found' });
    
    const currentCount = confession.reactions.get(reaction) || 0;
    confession.reactions.set(reaction, currentCount + 1);
    await confession.save();
    
    res.json({ message: 'Reaction added', reactions: Object.fromEntries(confession.reactions) });
  } catch (error) {
    res.status(500).json({ message: 'Error adding reaction' });
  }
};

export const removeReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { confessionId } = req.params;
    const { reaction } = req.body;
    const confession = await Confession.findById(confessionId);
    
    if (!confession) return res.status(404).json({ message: 'Confession not found' });
    
    const currentCount = confession.reactions.get(reaction) || 0;
    if (currentCount > 0) {
      confession.reactions.set(reaction, currentCount - 1);
      await confession.save();
    }
    
    res.json({ message: 'Reaction removed', reactions: Object.fromEntries(confession.reactions) });
  } catch (error) {
    res.status(500).json({ message: 'Error removing reaction' });
  }
}; 