import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/Button';
import Input from './ui/Input';
import { Select } from './ui/Select';
import { useToast } from './ui/use-toast';
import { getConfessions } from '../services/confessionService';
import { ConfessionCard } from './ConfessionCard';

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
}

interface ConfessionListProps {
  filter?: 'all' | 'trending' | 'recent' | 'popular';
}

export const ConfessionList: React.FC<ConfessionListProps> = ({ filter: initialFilter = 'all' }) => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log(confessions);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      const response = await getConfessions({
        page,
        limit: 10,
        filter,
        search,
      });
      console.log(response);

      if (page === 1) {
        setConfessions(response.confessions?.map(c => ({
          ...c,
          author: c.author || 'Anonymous'
        })) || []);
      } else {
        setConfessions(prev => [...prev, ...(response.confessions?.map(c => ({
          ...c,
          author: c.author || 'Anonymous'
        })) || [])]);
      }

      setHasMore(response.pagination?.currentPage < response.pagination?.totalPages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load confessions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, [page, filter, search]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as 'all' | 'trending' | 'recent' | 'popular');
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search confessions..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          value={filter}
          onValueChange={handleFilterChange}
          className="w-full sm:w-48"
        >
          <option value="all">All Confessions</option>
          <option value="trending">Trending</option>
          <option value="recent">Recent</option>
          <option value="popular">Most Popular</option>
        </Select>
      </div>

      <div className="space-y-4">
        {confessions && confessions.length > 0 ? (
          confessions.map((confession) => (
            <ConfessionCard
              key={confession.id}
              confession={confession}
              onClick={() => navigate(`/confessions/${confession.id}`)}
            />
          ))
        ) : (
          <Card className="p-4 text-center">
            <p>No confessions found.</p>
          </Card>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}; 