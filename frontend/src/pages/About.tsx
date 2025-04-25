import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  HeartIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const About: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-primary-500" />,
      title: 'Safe & Secure',
      description:
        'Our platform uses advanced security measures to protect your privacy and ensure a safe environment for all users.',
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-primary-500" />,
      title: 'College Community',
      description:
        'Connect with students from your college through anonymous confessions and build meaningful connections.',
    },
    {
      icon: <HeartIcon className="h-8 w-8 text-primary-500" />,
      title: 'Express Yourself',
      description:
        'Share your thoughts, feelings, and experiences without fear of judgment. Be yourself, anonymously.',
    },
    {
      icon: <LockClosedIcon className="h-8 w-8 text-primary-500" />,
      title: 'Complete Anonymity',
      description:
        'Your identity remains private. We never share personal information or track confession authors.',
    },
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            About Campus Confessions
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            A safe space for college students to share their thoughts, connect with
            peers, and express themselves freely.
          </p>
        </motion.div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900">
            Our Mission
          </h3>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We believe that everyone should have a space to express themselves
            freely and connect with others who share similar experiences. Campus
            Confessions is built on the principles of privacy, security, and
            community, providing students with a platform to share their stories
            while maintaining their anonymity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 bg-primary-50 rounded-lg p-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            Community Guidelines
          </h3>
          <ul className="mt-4 space-y-4 text-base text-gray-600">
            <li>• Respect others' privacy and feelings</li>
            <li>• No hate speech or harassment</li>
            <li>• No sharing of personal information</li>
            <li>• Keep content appropriate and constructive</li>
            <li>• Report inappropriate content</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 