import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/Button';
import { useToast } from '../ui/use-toast';
import { Users, Flag, Settings, BarChart2 } from 'lucide-react';

interface DashboardStat {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: number;
}

const dashboardStats: DashboardStat[] = [
  {
    title: 'Total Users',
    value: 1234,
    icon: <Users className="h-6 w-6 text-primary" />,
    change: 12,
  },
  {
    title: 'Reported Content',
    value: 56,
    icon: <Flag className="h-6 w-6 text-primary" />,
    change: -5,
  },
  {
    title: 'Active Confessions',
    value: 789,
    icon: <BarChart2 className="h-6 w-6 text-primary" />,
    change: 8,
  },
  {
    title: 'System Status',
    value: 100,
    icon: <Settings className="h-6 w-6 text-primary" />,
  },
];

export const AdminDashboard: React.FC = () => {
  const { toast } = useToast();

  const handleRefresh = () => {
    toast({
      title: 'Success',
      description: 'Dashboard data refreshed',
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Button onClick={handleRefresh}>
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {stat.icon}
                  <h3 className="text-lg font-semibold">{stat.title}</h3>
                </div>
                {stat.change !== undefined && (
                  <span
                    className={`text-sm ${
                      stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Add recent activity list here */}
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">System Alerts</h3>
          <div className="space-y-4">
            {/* Add system alerts list here */}
            <p className="text-muted-foreground">No system alerts</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button className="w-full justify-start">
              <Flag className="h-4 w-4 mr-2" />
              Review Reports
            </Button>
            <Button className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
          <div className="h-64 flex items-center justify-center">
            {/* Add performance metrics chart here */}
            <p className="text-muted-foreground">Performance metrics chart will be displayed here</p>
          </div>
        </Card>
      </div>
    </div>
  );
}; 