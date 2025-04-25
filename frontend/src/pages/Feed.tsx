import React, { useState, useEffect } from 'react';
import { confessionAPI } from '../services/api';
import { ConfessionView } from '../components/Confession';
import { useAuth } from '../context/AuthContext';

interface Confession {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isAnonymous: boolean;
  likes: number;
  dislikes: number;
  comments: any[];
}

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'college'>('all');

  const fetchConfessions = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await confessionAPI.getConfessions(pageNum);
      const newConfessions = response.data.confessions;
      
      if (newConfessions.length < 10) {
        setHasMore(false);
      }

      setConfessions(prev => 
        pageNum === 1 ? newConfessions : [...prev, ...newConfessions]
      );
    } catch (error) {
      console.error('Failed to fetch confessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions(1);
  }, [filter]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      if (!loading && hasMore) {
        setPage(prev => prev + 1);
        fetchConfessions(page + 1);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Confessions Feed</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'college')}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Confessions</option>
            <option value="college">My College</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {confessions.map(confession => (
          <ConfessionView
            key={confession.id}
            confession={confession}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!hasMore && confessions.length > 0 && (
        <p className="text-center text-gray-600 py-6">
          No more confessions to load
        </p>
      )}

      {!loading && confessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No confessions found</p>
          {filter === 'college' && (
            <p className="mt-2 text-gray-500">
              Be the first to confess in {user?.collegeName}!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed; 