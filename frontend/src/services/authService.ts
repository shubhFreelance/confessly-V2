import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    college: string;
  };
}

interface RegisterResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    college: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const register = async (
  username: string,
  email: string,
  password: string,
  college: string
): Promise<RegisterResponse> => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    username,
    email,
    password,
    college,
  });
  return response.data;
};

export const resetPassword = async (email: string): Promise<void> => {
  await axios.post(`${API_URL}/auth/reset-password`, { email });
};

export const verifyResetToken = async (token: string): Promise<void> => {
  await axios.get(`${API_URL}/auth/verify-reset-token/${token}`);
};

export const changePassword = async (token: string, newPassword: string): Promise<void> => {
  await axios.post(`${API_URL}/auth/change-password`, { token, newPassword });
};

export const refreshToken = async (refreshToken: string): Promise<{ token: string }> => {
  const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
  return response.data;
}; 