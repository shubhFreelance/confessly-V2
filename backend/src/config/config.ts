import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-confessions',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
}; 