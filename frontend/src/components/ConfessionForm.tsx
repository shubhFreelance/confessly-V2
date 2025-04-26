import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  {Button } from './ui/Button';
import Input from './ui/Input';
import  Textarea  from './ui/Textarea';
import  Switch  from './ui/Switch';
import  Label  from './ui/Label';
import  {useToast}  from './ui/use-toast';
import { createConfession } from '../services/confessionService';
import { useAuth } from '../context/AuthContext';

interface ConfessionFormProps {
  onSuccess?: () => void;
}

export const ConfessionForm: React.FC<ConfessionFormProps> = ({ onSuccess }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user} = useAuth();
  1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.collegeName) {
      toast({
        title: 'Error',
        description: 'College name is required',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      await createConfession({
        content,
        isAnonymous,
        collegeName: user.collegeName
      });

      toast({
        title: 'Success!',
        description: 'Your confession has been posted.',
      });

      setContent('');
      setIsAnonymous(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post confession. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Your Confession</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          required
          className="min-h-[150px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
        />
        <Label htmlFor="anonymous">Post Anonymously</Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post Confession'}
      </Button>
    </form>
  );
}; 