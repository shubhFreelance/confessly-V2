import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { ConfessionForm } from '../components/ConfessionForm';
import { ConfessionList } from '../components/ConfessionList';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const features = [
  {
    name: 'Anonymous Confessions',
    description:
      'Share your thoughts and feelings without revealing your identity. Our platform ensures complete anonymity.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'College Communities',
    description:
      'Connect with students from your college. Build meaningful connections through shared experiences.',
    icon: UserGroupIcon,
  },
  {
    name: 'Safe Environment',
    description:
      'Advanced moderation and reporting systems to maintain a respectful and safe space for everyone.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Premium Features',
    description:
      'Unlock additional features with our subscription plans. Get more visibility and engagement.',
    icon: SparklesIcon,
  },
];

export const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Confessions</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ConfessionList />
            </TabsContent>
            <TabsContent value="trending">
              <ConfessionList filter="trending" />
            </TabsContent>
            <TabsContent value="recent">
              <ConfessionList filter="recent" />
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Share Your Confession</h2>
            <ConfessionForm />
          </Card>
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Trending Topics</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>#CollegeLife</span>
                <span className="text-sm text-muted-foreground">245 confessions</span>
              </div>
              <div className="flex items-center justify-between">
                <span>#Exams</span>
                <span className="text-sm text-muted-foreground">189 confessions</span>
              </div>
              <div className="flex items-center justify-between">
                <span>#CampusEvents</span>
                <span className="text-sm text-muted-foreground">156 confessions</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home; 