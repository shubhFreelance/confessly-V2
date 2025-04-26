import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Confession } from '../models/Confession';

interface AuthRequest extends Request {
  user?: IUser;
}

// Update user theme
export const updateTheme = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { theme } = req.body;
    user.preferences.theme = theme;
    await user.save();

    res.json({ message: 'Theme updated successfully' });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ message: 'Server error while updating theme' });
  }
};

// Toggle private vault
export const togglePrivateVault = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    user.preferences.hasPrivateVault = !user.preferences.hasPrivateVault;
    await user.save();

    res.json({ 
      message: 'Private vault toggled successfully',
      hasPrivateVault: user.preferences.hasPrivateVault
    });
  } catch (error) {
    console.error('Error toggling private vault:', error);
    res.status(500).json({ message: 'Server error while toggling private vault' });
  }
};

// Add confession to private vault
export const addToPrivateVault = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { confessionId } = req.params;
    const confession = await Confession.findById(confessionId);

    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    if (confession.recipient.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this confession' });
    }

    confession.isHidden = true;
    await confession.save();

    res.json({ message: 'Confession added to private vault' });
  } catch (error) {
    console.error('Error adding to private vault:', error);
    res.status(500).json({ message: 'Server error while adding to private vault' });
  }
};

// Remove confession from private vault
export const removeFromPrivateVault = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { confessionId } = req.params;
    const confession = await Confession.findById(confessionId);

    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    if (confession.recipient.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this confession' });
    }

    confession.isHidden = false;
    await confession.save();

    res.json({ message: 'Confession removed from private vault' });
  } catch (error) {
    console.error('Error removing from private vault:', error);
    res.status(500).json({ message: 'Server error while removing from private vault' });
  }
};

// Purchase boost pack
export const purchaseBoostPack = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { packType, duration } = req.body;
    const boostEndDate = new Date();
    boostEndDate.setDate(boostEndDate.getDate() + duration);

    user.stats.boostEndDate = boostEndDate;
    user.stats.boostType = packType;
    await user.save();

    res.json({ 
      message: 'Boost pack purchased successfully',
      boostEndDate,
      boostType: packType
    });
  } catch (error) {
    console.error('Error purchasing boost pack:', error);
    res.status(500).json({ message: 'Server error while purchasing boost pack' });
  }
};

export const getPremiumFeatures = async (req: Request, res: Response) => {
  try {
    const features = {
      basic: ['Basic profile', 'Limited confessions'],
      premium: ['Unlimited confessions', 'Custom themes', 'Private vault'],
      platinum: ['All premium features', 'Priority support', 'Analytics']
    };
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching premium features' });
  }
};

export const upgradeToPremium = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    user.subscription = {
      tier: 'platinum',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      messageCount: 0,
      allowedColleges: user.subscription.allowedColleges
    };
    await user.save();
    res.json({ message: 'Upgraded to premium successfully', subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error upgrading to premium' });
  }
};

export const cancelPremium = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    user.subscription = {
      tier: 'basic',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      messageCount: 0,
      allowedColleges: user.subscription.allowedColleges
    };
    await user.save();
    res.json({ message: 'Premium subscription cancelled', subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling premium' });
  }
}; 