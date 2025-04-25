import Stripe from 'stripe';
import { config } from '../config';
import { User, IUser } from '../models/User';

const stripe = new Stripe(config.stripe.secretKey || '', {
  apiVersion: '2023-10-16'
});

const planMap: { [key: string]: 'basic' | 'silver' | 'gold' | 'platinum' } = {
  'price_basic': 'basic',
  'price_silver': 'silver',
  'price_gold': 'gold',
  'price_platinum': 'platinum'
};

export const createSubscription = async (user: IUser, priceId: string) => {
  try {
    let customerId = user.stripeCustomerId;

    // Create a new customer if one doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const handleSubscriptionChange = async (subscription: Stripe.Subscription) => {
  try {
    const userId = subscription.metadata.userId;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (subscription.status === 'active') {
      const priceId = subscription.items.data[0].price.id;
      user.subscription = {
        ...user.subscription,
        tier: planMap[priceId] || 'basic',
        expiresAt: new Date(subscription.current_period_end * 1000)
      };
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      user.subscription = {
        ...user.subscription,
        tier: 'basic',
        expiresAt: new Date()
      };
    }

    user.stripeSubscriptionId = subscription.id;
    await user.save();
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
};

export const cancelSubscription = async (user: IUser) => {
  try {
    if (!user.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    user.subscription = {
      ...user.subscription,
      tier: 'basic',
      expiresAt: new Date()
    };
    user.stripeSubscriptionId = undefined;
    await user.save();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const handleWebhook = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const user = await User.findOne({ stripeCustomerId: invoice.customer });
          if (user) {
            // Update user subscription status based on the plan
            const priceId = subscription.items.data[0].price.id;
            user.subscription.tier = planMap[priceId] || 'basic';
            user.subscription.expiresAt = new Date(subscription.current_period_end * 1000);
            await user.save();
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        // Handle failed payment (e.g., notify user, downgrade plan)
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const user = await User.findOne({ stripeCustomerId: deletedSubscription.customer });
        if (user) {
          user.subscription.tier = 'basic';
          await user.save();
        }
        break;
    }
  } catch (error) {
    console.error('Webhook handling error:', error);
    throw error;
  }
}; 