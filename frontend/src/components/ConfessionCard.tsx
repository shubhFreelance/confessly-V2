import React from 'react';
import { Card } from './ui/card';
import { Button }  from './ui/Button';
import { useToast } from './ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Flag, Share2 } from 'lucide-react';
import { addReaction, reportConfession } from '../services/confessionService';

interface ConfessionCardProps {
  confession: {
    id: string;
    content: string;
    isAnonymous: boolean;
    createdAt: string;
    author?: {
      username: string;
      college: string;
    };
    reactions: {
      type: string;
      count: number;
    }[];
    comments: number;
  };
  onClick?: () => void;
}

export const ConfessionCard: React.FC<ConfessionCardProps> = ({ confession, onClick }) => {
  const { toast } = useToast();

  const handleReaction = async (type: string) => {
    try {
      await addReaction(confession.id, type);
      toast({
        title: 'Success',
        description: 'Reaction added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    }
  };

  const handleReport = async () => {
    try {
      await reportConfession(confession.id, 'Inappropriate content');
      toast({
        title: 'Success',
        description: 'Confession reported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to report confession',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/confessions/${confession.id}`
      );
      toast({
        title: 'Success',
        description: 'Link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {confession.isAnonymous ? 'Anonymous' : confession.author?.username}
            </p>
            <p className="text-sm text-muted-foreground">
              {confession.author?.college}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(confession.createdAt), { addSuffix: true })}
          </p>
        </div>

        <p className="text-base">{confession.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReaction('like');
              }}
            >
              <Heart className="h-4 w-4 mr-1" />
              {confession.reactions.find((r) => r.type === 'like')?.count || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {confession.comments}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReport();
              }}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}; 