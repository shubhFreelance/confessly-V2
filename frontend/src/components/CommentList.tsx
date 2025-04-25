import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from './ui/card';
import {Button} from './ui/Button';
import { useToast } from './ui/use-toast';
import { socketService } from '../services/socketService';
import { RootState } from '../store';
import { CommentCard } from './CommentCard';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
    college: string;
  };
}

interface CommentListProps {
  confessionId: string;
}

export const CommentList: React.FC<CommentListProps> = ({ confessionId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Here you would typically make an API call to fetch comments
        // For now, we'll use mock data
        const mockComments: Comment[] = [
          {
            id: '1',
            content: 'This is a great confession!',
            createdAt: new Date().toISOString(),
            author: {
              username: 'user1',
              college: 'College 1',
            },
          },
          {
            id: '2',
            content: 'I can relate to this.',
            createdAt: new Date().toISOString(),
            author: {
              username: 'user2',
              college: 'College 2',
            },
          },
        ];
        setComments(mockComments);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load comments',
          variant: 'destructive',
        });
      }
    };

    fetchComments();
  }, [confessionId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to create comment
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        author: {
          username: user?.username || 'Anonymous',
          college: user?.college || 'Unknown',
        },
      };

      // Emit socket event for real-time updates
      socketService.emitCommentAdded(confessionId, comment);

      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border rounded"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onDelete={() => {
              setComments(comments.filter((c) => c.id !== comment.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}; 