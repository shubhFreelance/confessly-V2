import { Request, Response } from 'express';
import { User } from '../models/User';
import { Confession } from '../models/Confession';
import { ReportedConfession } from '../models/ReportedConfession';
import { auth, adminAuth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

// Get reported confessions for admin's college
export const getReportedConfessions = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reportedConfessions = await ReportedConfession.find({
      collegeName: user.collegeName,
      status
    })
      .populate('confession')
      .populate('reportedBy', 'username')
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ReportedConfession.countDocuments({
      collegeName: user.collegeName,
      status
    });

    res.json({
      reportedConfessions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting reported confessions:', error);
    res.status(500).json({ message: 'Error fetching reported confessions' });
  }
};

// Update reported confession status
export const updateReportedConfession = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const report = await ReportedConfession.findOne({
      _id: reportId,
      collegeName: user.collegeName
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.adminNotes = adminNotes;
    report.resolvedBy = user._id;
    report.resolvedAt = new Date();

    await report.save();

    res.json(report);
  } catch (error) {
    console.error('Error updating reported confession:', error);
    res.status(500).json({ message: 'Error updating reported confession' });
  }
};

// Get all users in admin's college
export const getCollegeUsers = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { collegeName: user.collegeName };
    if (search) {
      query.$or = [
        { username: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting college users:', error);
    res.status(500).json({ message: 'Error fetching college users' });
  }
};

// Manage college-specific content
export const getCollegeContent = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { type = 'all', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { collegeName: user.collegeName };
    if (type !== 'all') {
      query.type = type;
    }

    const content = await Confession.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Confession.countDocuments(query);

    res.json({
      content,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting college content:', error);
    res.status(500).json({ message: 'Error fetching college content' });
  }
};

// Get college statistics
export const getCollegeStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const [
      totalUsers,
      activeUsers,
      totalConfessions,
      reportedConfessions,
      blockedUsers
    ] = await Promise.all([
      User.countDocuments({ collegeName: user.collegeName }),
      User.countDocuments({
        collegeName: user.collegeName,
        'stats.lastActive': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Confession.countDocuments({ collegeName: user.collegeName }),
      ReportedConfession.countDocuments({
        collegeName: user.collegeName,
        status: 'pending'
      }),
      User.countDocuments({
        collegeName: user.collegeName,
        isBlocked: true
      })
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalConfessions,
      reportedConfessions,
      blockedUsers
    });
  } catch (error) {
    console.error('Error getting college stats:', error);
    res.status(500).json({ message: 'Error fetching college statistics' });
  }
}; 