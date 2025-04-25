import { Confession } from '../models/Confession';
import { User } from '../models/User';

interface SearchFilters {
  query?: string;
  collegeName?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  sortBy?: 'recent' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}

export class SearchService {
  static async searchConfessions(filters: SearchFilters) {
    const query: any = {};

    // Text search
    if (filters.query) {
      query.$or = [
        { content: { $regex: filters.query, $options: 'i' } },
        { tags: { $regex: filters.query, $options: 'i' } }
      ];
    }

    // College filter
    if (filters.collegeName) {
      query.collegeName = filters.collegeName;
    }

    // Date range filter
    if (filters.dateRange) {
      query.createdAt = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sortOptions: any = {};
    switch (filters.sortBy) {
      case 'popular':
        sortOptions = { likes: -1 };
        break;
      case 'trending':
        sortOptions = { views: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const [confessions, total] = await Promise.all([
      Confession.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username'),
      Confession.countDocuments(query)
    ]);

    return {
      confessions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async searchUsers(filters: SearchFilters) {
    const query: any = {};

    if (filters.query) {
      query.$or = [
        { username: { $regex: filters.query, $options: 'i' } },
        { collegeName: { $regex: filters.query, $options: 'i' } }
      ];
    }

    if (filters.collegeName) {
      query.collegeName = filters.collegeName;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
} 