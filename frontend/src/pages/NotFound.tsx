import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go back home
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            Lost? Try one of these popular pages:
          </p>
          <div className="mt-4 space-y-2">
            <Link
              to="/confessions"
              className="block text-primary-600 hover:text-primary-700"
            >
              Browse Confessions
            </Link>
            <Link
              to="/register"
              className="block text-primary-600 hover:text-primary-700"
            >
              Create an Account
            </Link>
            <Link
              to="/about"
              className="block text-primary-600 hover:text-primary-700"
            >
              About Us
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound; 