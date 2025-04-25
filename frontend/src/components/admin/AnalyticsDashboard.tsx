import React, { useEffect, useState } from 'react';
import { AdminStats } from '../../types/admin';
import adminApi from '../../services/adminApi';
import { formatNumber } from '../../lib/utils';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon,
  FlagIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: number;
}> = ({ title, value, icon, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{formatNumber(value)}</p>
        {change !== undefined && (
          <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
      <div className="text-primary-500">{icon}</div>
    </div>
  </div>
);

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<UserGroupIcon className="h-8 w-8" />}
        />
        <StatCard
          title="Total Confessions"
          value={stats.totalConfessions}
          icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
        />
        <StatCard
          title="Reported Confessions"
          value={stats.reportedConfessions}
          icon={<FlagIcon className="h-8 w-8" />}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<UserIcon className="h-8 w-8" />}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 