import { Request, Response } from 'express';
import { User } from '../models/User';
import { Confession } from '../models/Confession';
import { ReportedConfession } from '../models/ReportedConfession';
import { auth, adminAuth } from '../middleware/auth';
import { createNotification } from '../services/notificationService';

interface AuthRequest extends Request {
  user?: any;
}

// Manage subscription tiers
export const manageSubscriptionTiers = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId, tier, allowedColleges } = req.body;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    targetUser.subscription = {
      ...targetUser.subscription,
      tier,
      allowedColleges
    };

    await targetUser.save();

    // Notify user of subscription change
    await createNotification({
      recipient: userId,
      type: 'system',
      title: 'Subscription Updated',
      message: `Your subscription has been updated to ${tier} tier.`
    });

    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Error managing subscription:', error);
    res.status(500).json({ message: 'Error updating subscription' });
  }
};

// View system-wide analytics
export const getSystemAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const [
      totalUsers,
      totalAdmins,
      totalConfessions,
      totalReports,
      collegeStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isAdmin: true }),
      Confession.countDocuments(),
      ReportedConfession.countDocuments(),
      User.aggregate([
        {
          $group: {
            _id: '$collegeName',
            userCount: { $sum: 1 },
            adminCount: {
              $sum: { $cond: [{ $eq: ['$isAdmin', true] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    res.json({
      totalUsers,
      totalAdmins,
      totalConfessions,
      totalReports,
      collegeStats
    });
  } catch (error) {
    console.error('Error getting system analytics:', error);
    res.status(500).json({ message: 'Error fetching system analytics' });
  }
};

// Manage all users across colleges
export const manageUsers = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { page = 1, limit = 20, search, college } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (search) {
      query.$or = [
        { username: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }
    if (college) {
      query.collegeName = college;
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
    console.error('Error managing users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Override admin decisions
export const overrideAdminDecision = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const report = await ReportedConfession.findById(reportId);
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
    console.error('Error overriding admin decision:', error);
    res.status(500).json({ message: 'Error updating report' });
  }
};

// Manage system settings
export const manageSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { setting, value } = req.body;

    // Update system settings (implement your settings storage)
    // This is a placeholder - implement your settings storage mechanism
    res.json({ message: 'System settings updated' });
  } catch (error) {
    console.error('Error managing system settings:', error);
    res.status(500).json({ message: 'Error updating system settings' });
  }
};

// Manage all reports
export const manageReports = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status = 'pending', page = 1, limit = 20, college } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { status };
    if (college) {
      query.collegeName = college;
    }

    const reports = await ReportedConfession.find(query)
      .populate('confession')
      .populate('reportedBy', 'username')
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ReportedConfession.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: page
    });
  } catch (error) {
    console.error('Error managing reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// Manage college-wide announcements
export const manageAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { collegeName, message, title } = req.body;

    // Create announcement notification for all users in the college
    const collegeUsers = await User.find({ collegeName });
    for (const collegeUser of collegeUsers) {
      await createNotification({
        recipient: collegeUser._id,
        type: 'system',
        title: title || 'College Announcement',
        message,
        data: { type: 'announcement' }
      });
    }

    res.json({ message: 'Announcement sent successfully' });
  } catch (error) {
    console.error('Error managing announcements:', error);
    res.status(500).json({ message: 'Error sending announcement' });
  }
};

// Access and modify any user's data
export const modifyUserData = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.params;
    const updates = req.body;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user data
    Object.assign(targetUser, updates);
    await targetUser.save();

    res.json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error modifying user data:', error);
    res.status(500).json({ message: 'Error updating user data' });
  }
};

// Manage system-wide notifications
export const manageSystemNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, message, target } = req.body;

    if (target === 'all') {
      // Send to all users
      const allUsers = await User.find();
      for (const targetUser of allUsers) {
        await createNotification({
          recipient: targetUser._id,
          type: 'system',
          title,
          message,
          data: { type: 'system_notification' }
        });
      }
    } else if (target === 'college') {
      // Send to specific college
      const { collegeName } = req.body;
      const collegeUsers = await User.find({ collegeName });
      for (const collegeUser of collegeUsers) {
        await createNotification({
          recipient: collegeUser._id,
          type: 'system',
          title,
          message,
          data: { type: 'system_notification' }
        });
      }
    }

    res.json({ message: 'System notification sent successfully' });
  } catch (error) {
    console.error('Error managing system notifications:', error);
    res.status(500).json({ message: 'Error sending system notification' });
  }
}; 