import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/confessly';

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true
};

// Create indexes
// const createIndexes = async () => {
//   try {
//     // User indexes
//     await mongoose.model('User').createIndexes([
//       { key: { email: 1 }, unique: true, name: 'email_unique' },
//       { key: { username: 1 }, unique: true, name: 'username_unique' },
//       { key: { confessionLink: 1 }, unique: true, name: 'confessionLink_unique' },
//       { key: { 'stats.weeklyRank': -1 }, name: 'weeklyRank_desc' },
//       { key: { 'stats.monthlyRank': -1 }, name: 'monthlyRank_desc' }
//     ]);

//     // Confession indexes
//     await mongoose.model('Confession').createIndexes([
//       { key: { author: 1 }, name: 'author_idx' },
//       { key: { collegeName: 1 }, name: 'collegeName_idx' },
//       { key: { tags: 1 }, name: 'tags_idx' },
//       { key: { createdAt: -1 }, name: 'createdAt_desc' },
//       { key: { likes: -1 }, name: 'likes_desc' },
//       { key: { views: -1 }, name: 'views_desc' }
//     ]);

//     // Notification indexes
//     await mongoose.model('Notification').createIndexes([
//       { key: { recipient: 1 }, name: 'recipient_idx' },
//       { key: { createdAt: -1 }, name: 'createdAt_desc' },
//       { key: { isRead: 1 }, name: 'isRead_idx' }
//     ]);

//     logger.info('Database indexes created successfully');
//   } catch (error) {
//     logger.error('Error creating database indexes:', error);
//     throw error;
//   }
// };

// Connect to database
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Let Mongoose handle index creation through schema definitions
    // This will use the indexes defined in each model's schema
    await Promise.all([
      mongoose.model('User').syncIndexes(),
      mongoose.model('Confession').syncIndexes(),
      mongoose.model('Notification').syncIndexes()
    ]);

    logger.info('Database indexes synchronized successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}; 