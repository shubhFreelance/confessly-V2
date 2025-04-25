import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { createServer } from 'http';
import { generalLimiter } from './middleware/rateLimiter';
import { initializeWebSocket } from './services/notificationService';
import authRoutes from './routes/auth';
import confessionRoutes from './routes/confessions';
import commentRoutes from './routes/comments';
import notificationRoutes from './routes/notifications';
import analyticsRoutes from './routes/analyticsRoutes';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import superadminRoutes from './routes/superadmin';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(generalLimiter);

// Create uploads directory for file uploads
import { mkdirSync } from 'fs';
import path from 'path';
mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/confessly';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Campus Confessions API' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 