import React, { useState } from 'react';
import { useToast } from './ui/use-toast';
import {Button} from './ui/Button';
import Textarea from './ui/Textarea';
import  Switch  from './ui/Switch';
import  Label  from './ui/Label';
import { createComment } from '../services/commentService';

interface CommentFormProps {
  confessionId: string;
  onSuccess?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ confessionId, onSuccess }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createComment({
        confessionId,
        content,
        isAnonymous,
      });

      toast({
        title: 'Success!',
        description: 'Your comment has been posted.',
      });

      setContent('');
      setIsAnonymous(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Your Comment</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          required
          className="min-h-[100px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
        />
        <Label htmlFor="anonymous">Comment Anonymously</Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  );
}; 