import { Request, Response } from 'express';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    const plans = {
      basic: { price: 0, features: ['Basic profile', 'Limited confessions'] },
      silver: { price: 9.99, features: ['Unlimited confessions', 'Custom themes', 'Private vault'] },
      gold: { price: 19.99, features: ['All silver features', 'Priority support', 'Analytics'] },
      platinum: { price: 29.99, features: ['All gold features', 'VIP support', 'Advanced analytics'] }
    };
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription plans' });
  }
};

export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    const { tier } = req.body;
    user.subscription = {
      tier,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      messageCount: 0,
      allowedColleges: user.subscription.allowedColleges
    };
    await user.save();
    res.json({ message: 'Subscription updated', subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription' });
  }
};

export const unsubscribe = async (req: AuthRequest, res: Response) => {
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
    res.json({ message: 'Subscription cancelled', subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
}; 