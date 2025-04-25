import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Promotion } from '../models/Promotion';

interface AuthRequest extends Request {
  user?: IUser;
}

// Get banner ads for free users
export const getBannerAds = async (req: Request, res: Response) => {
  try {
    const ads = await Promotion.find({ 
      type: 'banner',
      isActive: true,
      endDate: { $gt: new Date() }
    });
    res.json(ads);
  } catch (error) {
    console.error('Error getting banner ads:', error);
    res.status(500).json({ message: 'Server error while getting banner ads' });
  }
};

// Create promotion (admin only)
export const createPromotion = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, collegeName, duration } = req.body;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const promotion = new Promotion({
      title,
      content,
      collegeName,
      endDate,
      createdBy: user._id
    });

    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: 'Server error while creating promotion' });
  }
};

// Get active promotions
export const getActivePromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await Promotion.find({
      isActive: true,
      endDate: { $gt: new Date() }
    }).populate('createdBy', 'username');
    res.json(promotions);
  } catch (error) {
    console.error('Error getting active promotions:', error);
    res.status(500).json({ message: 'Server error while getting promotions' });
  }
};

// Update promotion (admin only)
export const updatePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { id } = req.params;
    const { title, content, duration } = req.body;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    if (duration) {
      promotion.endDate = new Date();
      promotion.endDate.setDate(promotion.endDate.getDate() + duration);
    }

    promotion.title = title || promotion.title;
    promotion.content = content || promotion.content;
    await promotion.save();

    res.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Server error while updating promotion' });
  }
};

// Delete promotion (admin only)
export const deletePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { id } = req.params;
    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    await promotion.deleteOne();
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Server error while deleting promotion' });
  }
}; 