import { Request, Response } from 'express';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const getCollegeRankings = async (req: AuthRequest, res: Response) => {
  try {
    const { collegeName } = req.user;
    const rankings = await User.find({ collegeName })
      .sort({ 'stats.weeklyRank': 1 })
      .select('username stats.weeklyRank stats.monthlyRank');
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching college rankings' });
  }
};

export const getUserRankings = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    const rankings = await User.find({ collegeName: user.collegeName })
      .sort({ 'stats.weeklyRank': 1 })
      .select('username stats.weeklyRank stats.monthlyRank');
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user rankings' });
  }
}; 