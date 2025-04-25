import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

interface PlanFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Basic',
    price: 0,
    features: [
      {
        icon: <SparklesIcon className="h-5 w-5 text-primary-500" />,
        title: '3 Free Confessions',
        description: 'Get started with anonymous messaging',
      },
      {
        icon: <ShieldCheckIcon className="h-5 w-5 text-primary-500" />,
        title: 'Basic Moderation',
        description: 'Standard content filtering',
      },
    ],
    buttonText: 'Current Plan',
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 4.99,
    popular: true,
    features: [
      {
        icon: <SparklesIcon className="h-5 w-5 text-primary-500" />,
        title: 'Unlimited Confessions',
        description: 'Receive unlimited anonymous messages',
      },
      {
        icon: <ShieldCheckIcon className="h-5 w-5 text-primary-500" />,
        title: 'Advanced Moderation',
        description: 'Enhanced content filtering and reporting',
      },
      {
        icon: <GlobeAltIcon className="h-5 w-5 text-primary-500" />,
        title: 'View 3 Colleges',
        description: 'Access confessions from 3 other colleges',
      },
    ],
    buttonText: 'Upgrade to Silver',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 9.99,
    features: [
      {
        icon: <SparklesIcon className="h-5 w-5 text-primary-500" />,
        title: 'Everything in Silver',
        description: 'All Silver features included',
      },
      {
        icon: <BoltIcon className="h-5 w-5 text-primary-500" />,
        title: 'Ad-Free Experience',
        description: 'No advertisements',
      },
      {
        icon: <GlobeAltIcon className="h-5 w-5 text-primary-500" />,
        title: 'View All Colleges',
        description: 'Access confessions from any college',
      },
    ],
    buttonText: 'Upgrade to Gold',
  },
];

const Subscription: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      setError('');

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user?.id,
        }),
      });

      const session = await response.json();

      // Redirect to checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Unlock more features and reach a wider audience
        </p>
      </div>

      {error && (
        <div className="mt-8 text-center text-red-500">{error}</div>
      )}

      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
              plan.popular
                ? 'border-2 border-primary-500'
                : 'border border-gray-200'
            }`}
          >
            <div className="p-6">
              {plan.popular && (
                <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary-100 text-primary-600">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-semibold text-gray-900">
                {plan.name}
              </h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-base font-medium text-gray-500">
                  /month
                </span>
              </p>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || plan.id === user?.subscription?.type}
                className={`mt-8 w-full rounded-md px-4 py-2 text-sm font-semibold ${
                  plan.id === user?.subscription?.type
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                }`}
              >
                {loading ? 'Processing...' : plan.buttonText}
              </button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                What's included
              </h4>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    {feature.icon}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {feature.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Subscription; 