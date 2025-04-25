import React from 'react';
import { NotificationCard } from './NotificationCard';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from './ui/use-toast';

interface Notification {
  id: string;
  type: 'confession' | 'comment' | 'reaction' | 'system';
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
}) => {
  const { toast } = useToast();

  const handleMarkAllAsRead = async () => {
    try {
      notifications.forEach((notification) => {
        if (!notification.read) {
          onMarkAsRead?.(notification.id);
        }
      });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No notifications yet
            </p>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 