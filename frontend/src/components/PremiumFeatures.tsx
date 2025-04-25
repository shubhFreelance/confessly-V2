import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/Button';
import { useToast } from './ui/use-toast';
import { Crown, Lock, Star, Zap } from 'lucide-react';

interface PremiumFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const premiumFeatures: PremiumFeature[] = [
  {
    title: 'Private Vault',
    description: 'Store your private confessions securely with end-to-end encryption',
    icon: <Lock className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Priority Support',
    description: 'Get faster responses and dedicated support for your issues',
    icon: <Star className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Advanced Analytics',
    description: 'Track your confession performance with detailed insights',
    icon: <Zap className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Custom Themes',
    description: 'Personalize your experience with custom themes and colors',
    icon: <Crown className="h-6 w-6 text-primary" />,
  },
];

export const PremiumFeatures: React.FC = () => {
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: 'Coming Soon',
      description: 'Premium features will be available soon!',
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Premium Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock exclusive features to enhance your confession experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {feature.icon}
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          size="lg"
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Crown className="h-5 w-5 mr-2" />
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
}; 