import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/Button';
import { useToast } from './ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Flag, Trash, Trash2 } from 'lucide-react';
import { addReaction, reportComment, deleteComment } from '../services/commentService';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
    college: string;
  };
}

interface CommentCardProps {
  comment: Comment;
  onDelete: () => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, onDelete }) => {
  const { toast } = useToast();

  const handleReaction = async (type: string) => {
    try {
      await addReaction(comment.id, type);
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
      await reportComment(comment.id, 'Inappropriate content');
      toast({
        title: 'Success',
        description: 'Comment reported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to report comment',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
      onDelete();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{comment.author.username}</p>
            <p className="text-sm text-muted-foreground">
              {comment.author.college}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
          </p>
        </div>

        <p className="text-base">{comment.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('like')}
            >
              <Heart className="h-4 w-4 mr-1" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}; 