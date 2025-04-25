import React from 'react';
import { Card } from './ui/card';
import  {Button}  from './ui/Button';
import { useToast } from './ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, X } from 'lucide-react';

interface NotificationCardProps {
  notification: {
    id: string;
    type: 'confession' | 'comment' | 'reaction' | 'system';
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
  };
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const { toast } = useToast();

  const handleMarkAsRead = async () => {
    try {
      onMarkAsRead?.(notification.id);
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      onDelete?.(notification.id);
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={`p-4 ${notification.read ? 'bg-muted/50' : 'bg-background'} hover:shadow-lg transition-shadow`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">{notification.type}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>

        <p className="text-base">{notification.message}</p>

        <div className="flex items-center justify-end space-x-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}; 