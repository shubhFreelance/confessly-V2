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
}

interface GetConfessionsParams {
  page: number;
  limit: number;
  filter?: string;
  search?: string;
}

interface GetConfessionsResponse {
  data: Confession[];
  hasMore: boolean;
  total: number;
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

export const addReaction = async (id: string, type: string): Promise<void> => {
  await axios.post(`${API_URL}/confessions/${id}/reactions`, { type });
}; 