import React, { useState, useEffect } from 'react';
import { confessionAPI, commentAPI, reactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from './ui/card';
import { Button } from './ui/Button';
import { useToast } from './ui/use-toast';
import { socketService } from '../services/socketService';
import { setCurrentConfession, setLoading, setError } from '../store/slices/confessionSlice';
import { RootState } from '../store';
import { CommentList } from './CommentList';
import  ReportModal  from './ReportModal';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isAnonymous: boolean;
}

interface Confession {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isAnonymous: boolean;
  likes: number;
  dislikes: number;
  comments: Comment[];
}

export const ConfessionCreate: React.FC = () => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await confessionAPI.createConfession(content, isAnonymous);
      setContent('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Failed to create confession:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={4}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-500"
          />
          <span>Post anonymously</span>
        </label>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post Confession'}
        </button>
      </div>
    </form>
  );
};

export const ConfessionView: React.FC<{ confession: Confession }> = ({ confession }) => {
  const { user } = useAuth();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);

  const handleReaction = async (type: 'like' | 'dislike') => {
    try {
      await reactionAPI.addReaction(confession.id, type);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await commentAPI.addComment(confession.id, commentContent, isAnonymousComment);
      setCommentContent('');
      setIsAnonymousComment(false);
      setIsCommenting(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <p className="font-medium text-gray-900">
            {confession.isAnonymous ? 'Anonymous' : confession.author}
          </p>
          <span className="text-sm text-gray-500">
            {new Date(confession.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-800">{confession.content}</p>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => handleReaction('like')}
          className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
        >
          <span>👍 {confession.likes}</span>
        </button>
        <button
          onClick={() => handleReaction('dislike')}
          className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
        >
          <span>👎 {confession.dislikes}</span>
        </button>
        <button
          onClick={() => setIsCommenting(!isCommenting)}
          className="text-gray-500 hover:text-blue-500"
        >
          💬 Comment
        </button>
      </div>

      {isCommenting && (
        <form onSubmit={handleComment} className="space-y-2">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAnonymousComment}
                onChange={(e) => setIsAnonymousComment(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span className="text-sm">Comment anonymously</span>
            </label>
            <button
              type="submit"
              disabled={!commentContent.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Post Comment
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {confession.comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded p-2">
            <div className="flex justify-between items-start">
              <p className="font-medium text-sm text-gray-900">
                {comment.isAnonymous ? 'Anonymous' : comment.author}
              </p>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-800">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Confession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { currentConfession, isLoading } = useSelector((state: RootState) => state.confessions);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchConfession = async () => {
      if (!id) return;
      dispatch(setLoading(true));
      try {
        // Here you would typically make an API call to fetch the confession
        // For now, we'll use mock data
        const mockConfession = {
          id,
          content: 'This is a sample confession...',
          isAnonymous: true,
          createdAt: new Date().toISOString(),
          author: {
            username: 'Anonymous',
            college: 'Sample College',
          },
          reactions: [
            { type: 'like', count: 10 },
            { type: 'love', count: 5 },
          ],
          comments: 3,
        };
        dispatch(setCurrentConfession(mockConfession));
      } catch (error) {
        dispatch(setError('Failed to load confession'));
        toast({
          title: 'Error',
          description: 'Failed to load confession. Please try again.',
          variant: 'destructive',
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchConfession();
  }, [id, dispatch, toast]);

  const handleReaction = async (type: string) => {
    if (!id) return;
    try {
      // Here you would typically make an API call to add reaction
      socketService.emitReactionAdded(id, type);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/confessions/${id}`
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

  const handleReport = async (reason: string) => {
    if (!id) return;
    try {
      await confessionAPI.reportConfession(id, reason);
      toast({
        title: 'Success',
        description: 'Report submitted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentConfession) {
    return <div>Confession not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {currentConfession.isAnonymous ? 'Anonymous' : currentConfession.author?.username}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentConfession.author?.college}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(currentConfession.createdAt).toLocaleDateString()}
            </p>
          </div>

          <p className="text-base">{currentConfession.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentConfession.reactions.map((reaction) => (
                <Button
                  key={reaction.type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(reaction.type)}
                >
                  {reaction.type} ({reaction.count})
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
              >
                Report
              </Button>
              <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleReport}
                title="Report Confession"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        {id && <CommentList confessionId={id} />}
      </div>
    </div>
  );
}; 