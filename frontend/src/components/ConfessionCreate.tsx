import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card } from './ui/card';
import {Button } from './ui/Button';
import { useToast } from './ui/use-toast';
import { socketService } from '../services/socketService';
import { setLoading, setError } from '../store/slices/confessionSlice';

export const ConfessionCreate: React.FC = () => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your confession',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    dispatch(setLoading(true));

    try {
      // Here you would typically make an API call to create the confession
      const newConfession = {
        content: content.trim(),
        isAnonymous,
        createdAt: new Date().toISOString(),
      };

      // Emit socket event for real-time updates
      socketService.emitConfessionCreated(newConfession);

      toast({
        title: 'Success',
        description: 'Your confession has been posted',
      });

      // Reset form
      setContent('');
      setIsAnonymous(false);

      // Navigate to feed
      navigate('/feed');
    } catch (error) {
      dispatch(setError('Failed to create confession'));
      toast({
        title: 'Error',
        description: 'Failed to create confession. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Your Confession
          </label>
          <textarea
            id="content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Share your thoughts..."
            maxLength={1000}
          />
          <p className="mt-1 text-sm text-gray-500">
            {content.length}/1000 characters
          </p>
        </div>

        <div className="flex items-center">
          <input
            id="anonymous"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
            Post anonymously
          </label>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Posting...' : 'Post Confession'}
          </Button>
        </div>
      </form>
    </Card>
  );
}; 