import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  FlagIcon,
  TrashIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Confession {
  id: string;
  content: string;
  likes: number;
  reactions: { [key: string]: number };
  createdAt: string;
  isLiked?: boolean;
}

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '😡'];

const Confessions: React.FC = () => {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConfession, setSelectedConfession] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchConfessions();
  }, [user]);

  const fetchConfessions = async () => {
    try {
      const response = await axios.get(`/api/confessions/user/${user?.id}`);
      setConfessions(response.data.confessions);
    } catch (err) {
      setError('Failed to load confessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (confessionId: string) => {
    try {
      await axios.post(`/api/confessions/${confessionId}/react`, {
        reaction: '❤️',
      });

      setConfessions((prev) =>
        prev.map((confession) =>
          confession.id === confessionId
            ? {
                ...confession,
                likes: confession.likes + 1,
                isLiked: true,
              }
            : confession
        )
      );
    } catch (err) {
      console.error('Error liking confession:', err);
    }
  };

  const handleReaction = async (confessionId: string, emoji: string) => {
    try {
      await axios.post(`/api/confessions/${confessionId}/react`, {
        reaction: emoji,
      });

      setConfessions((prev) =>
        prev.map((confession) =>
          confession.id === confessionId
            ? {
                ...confession,
                reactions: {
                  ...confession.reactions,
                  [emoji]: (confession.reactions[emoji] || 0) + 1,
                },
              }
            : confession
        )
      );
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  const handleReport = async (confessionId: string) => {
    try {
      await axios.post(`/api/confessions/${confessionId}/report`, {
        reason: reportReason,
      });

      setConfessions((prev) =>
        prev.filter((confession) => confession.id !== confessionId)
      );
      setSelectedConfession(null);
      setReportReason('');
    } catch (err) {
      console.error('Error reporting confession:', err);
    }
  };

  const handleDelete = async (confessionId: string) => {
    try {
      await axios.delete(`/api/confessions/${confessionId}`);
      setConfessions((prev) =>
        prev.filter((confession) => confession.id !== confessionId)
      );
    } catch (err) {
      console.error('Error deleting confession:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Confessions</h1>

      {error && <div className="text-red-500 text-center mb-6">{error}</div>}

      <div className="space-y-6">
        <AnimatePresence>
          {confessions.map((confession) => (
            <motion.div
              key={confession.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <p className="text-gray-800 mb-4">{confession.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(confession.id)}
                    className={`flex items-center space-x-1 ${
                      confession.isLiked
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    {confession.isLiked ? (
                      <HeartIconSolid className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span>{confession.likes}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {EMOJI_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(confession.id, emoji)}
                        className="hover:bg-gray-100 rounded-full p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedConfession(confession.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <FlagIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(confession.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {selectedConfession === confession.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Report Confession
                  </h3>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Why are you reporting this confession?"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => setSelectedConfession(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReport(confession.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {confessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No confessions yet. Share your profile to receive anonymous messages!
          </div>
        )}
      </div>
    </div>
  );
};

export default Confessions; 