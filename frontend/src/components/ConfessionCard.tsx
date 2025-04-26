import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/Button';
import { useToast } from './ui/use-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Heart, MessageCircle, Flag, Share2 } from 'lucide-react';
import { addReaction, reportConfession } from '../services/confessionService';

interface Confession {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  author: string | { username: string; college: string };
  reactions: {
    type: string;
    count: number;
  }[];
  comments: number;
  likes: number;
  isHidden: boolean;
  isReported: boolean;
  likedByUser?: boolean;
}

interface ConfessionCardProps {
  confession: Confession;
  onClick?: () => void;
}

export const ConfessionCard: React.FC<ConfessionCardProps> = ({ confession, onClick }) => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(confession.likedByUser || false);
  const [likeCount, setLikeCount] = useState(confession.reactions.find(r => r.type === 'like')?.count || 0);

  useEffect(() => {
    setIsLiked(confession.likedByUser || false);
    setLikeCount(confession.reactions.find(r => r.type === 'like')?.count || 0);
  }, [confession]);

  const authorName = typeof confession.author === 'string' 
    ? confession.author 
    : confession.author.username;
  const collegeName = typeof confession.author === 'string' 
    ? 'Anonymous' 
    : confession.author.college;

  const handleReaction = async (type: string) => {
    try {
      if (type === 'like') {
        const prevIsLiked = isLiked;
        const prevLikeCount = likeCount;
        
        // Optimistic update
        setIsLiked(!prevIsLiked);
        setLikeCount(prevLikeCount + (prevIsLiked ? -1 : 1));
        
        const response = await addReaction(confession.id, type);
        
        // Update state with actual server response
        setIsLiked(response.likedByUser);
        setLikeCount(response.reactions['like'] || 0);
        
        toast({
          title: 'Success',
          description: response.message,
        });
      }
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      
      toast({
        title: 'Error',
        description: 'Failed to update reaction',
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

  // Time formatting
  const timeAgo = formatDistanceToNow(parseISO(confession.createdAt), { addSuffix: true });
  const date = new Date(confession.createdAt).toLocaleDateString();

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-gray-50 relative" 
      onClick={onClick}
      role="article"
    >
      {confession.isAnonymous && (
        <div className="">
          <span className=" top-2 left-2 px-2 py-1 bg-red-500 text-black">Anonymous</span>
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{authorName}</h3>
          <p className="text-sm text-gray-500">{collegeName}</p>
        </div>
        <span className="text-sm text-gray-500">
          {timeAgo} | {date}
        </span>
      </div>
      <p className="mb-4">{confession.content}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {confession.comments} comments
        </span>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleReaction('like');
            }}
            aria-label={isLiked ? 'unlike' : 'like'}
            className={isLiked ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            <span>like ({likeCount})</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            aria-label="comment"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>Comment</span>
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
            aria-label="share"
          >
            <Share2 className="h-4 w-4 mr-1" />
            <span>Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleReport();
            }}
            aria-label="report"
          >
            <Flag className="h-4 w-4 mr-1" />
            <span>Report</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
