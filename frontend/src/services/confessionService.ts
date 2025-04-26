import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface Confession {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  author?: {
    username: string;
    college: string;
  };
  reactions: {
    type: string;
    count: number;
  }[];
  comments: number;
  recipient?: string;
  likes: number;
  isHidden: boolean;
  isReported: boolean;
  likedByUser: boolean;
}

interface GetConfessionsParams {
  page: number;
  limit: number;
  filter?: string;
  search?: string;
}

interface GetConfessionsResponse {
  confessions: Confession[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalConfessions: number;
  };
}

interface ReactionResponse {
  message: string;
  reactions: { [key: string]: number };
  likedByUser: boolean;
}

export const getConfessions = async (params: GetConfessionsParams): Promise<GetConfessionsResponse> => {
  const response = await axios.get(`${API_URL}/confessions`, { params });
  return response.data;
};

export const getConfession = async (id: string): Promise<Confession> => {
  const response = await axios.get(`${API_URL}/confessions/${id}`);
  return response.data;
};

export const createConfession = async (data: { content: string; isAnonymous: boolean, collegeName: string }): Promise<Confession> => {
  const response = await axios.post(`${API_URL}/confessions`, data);
  return response.data;
};

export const deleteConfession = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/confessions/${id}`);
};

export const reportConfession = async (id: string, reason: string): Promise<void> => {
  await axios.post(`${API_URL}/confessions/${id}/report`, { reason });
};

export const addReaction = async (id: string, type: string): Promise<ReactionResponse> => {
  const response = await axios.post(`${API_URL}/reactions/${id}`, { reaction: type });
  return response.data;
}; 