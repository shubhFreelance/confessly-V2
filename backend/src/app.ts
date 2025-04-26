import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import compression from 'compression';
import { swaggerSpec } from './config/swagger';
import { NotificationService } from './services/notificationService';
import { applySecurityMiddleware } from './config/security';
import { errorHandler } from './middleware/errorHandler';
import { logger, morganMiddleware } from './config/logger';
import { MonitoringService } from './services/monitoringService';
import { CacheService } from './services/cacheService';
import { BackupService } from './services/backupService';
import { FileUploadService } from './services/fileUploadService';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Initialize services
NotificationService.setSocketIO(io);
MonitoringService.startMonitoring();
CacheService.initialize();
BackupService.initialize();

// Schedule regular backups (daily at midnight)
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    try {
      await BackupService.createBackup();
      await BackupService.cleanupOldBackups();
    } catch (error) {
      logger.error('Error during scheduled backup:', error);
    }
  }
}, 60 * 1000); // Check every minute

// Schedule file cleanup (daily at 1 AM)
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 1 && now.getMinutes() === 0) {
    try {
      await FileUploadService.cleanupUnusedFiles();
    } catch (error) {
      logger.error('Error during file cleanup:', error);
    }
  }
}, 60 * 1000); // Check every minute

// Apply security middleware
applySecurityMiddleware(app);

// Apply compression
app.use(compression());

// Apply logging middleware
app.use(morganMiddleware);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  const metrics = MonitoringService.getSystemMetrics();
  res.json({ status: 'healthy', metrics });
});

// Apply error handling middleware last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export { app, httpServer }; 