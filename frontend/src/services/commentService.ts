import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface Comment {
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
}

interface GetCommentsParams {
  page: number;
  limit: number;
}

interface GetCommentsResponse {
  data: Comment[];
  hasMore: boolean;
  total: number;
}

interface CreateCommentData {
  confessionId: string;
  content: string;
  isAnonymous: boolean;
}

export const getComments = async (
  confessionId: string,
  params: GetCommentsParams
): Promise<GetCommentsResponse> => {
  const response = await axios.get(`${API_URL}/comments/${confessionId}`, { params });
  return response.data;
};

export const createComment = async (data: CreateCommentData): Promise<Comment> => {
  const response = await axios.post(`${API_URL}/comments`, data);
  return response.data;
};

export const updateComment = async (id: string, content: string): Promise<Comment> => {
  const response = await axios.put(`${API_URL}/comments/${id}`, { content });
  return response.data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/comments/${id}`);
};

export const reportComment = async (id: string, reason: string): Promise<void> => {
  await axios.post(`${API_URL}/comments/${id}/report`, { reason });
};

export const addReaction = async (id: string, type: string): Promise<void> => {
  await axios.post(`${API_URL}/comments/${id}/reactions`, { type });
}; 