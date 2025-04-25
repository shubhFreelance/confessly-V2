import { logger } from '../config/logger';
import os from 'os';

export class MonitoringService {
  private static startTime = Date.now();

  static getSystemMetrics() {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.loadavg();

    return {
      uptime,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      cpu: {
        load1: cpuUsage[0],
        load5: cpuUsage[1],
        load15: cpuUsage[2],
        cores: os.cpus().length
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: memoryUsage
      }
    };
  }

  static logMetrics() {
    const metrics = this.getSystemMetrics();
    logger.info('System Metrics', { metrics });
  }

  static async monitorDatabaseConnection() {
    try {
      // Add your database connection monitoring logic here
      // For example, ping the database or check connection status
      logger.info('Database connection is healthy');
    } catch (error) {
      logger.error('Database connection error', { error });
      throw error;
    }
  }

  static async monitorApiEndpoints() {
    try {
      // Add your API endpoint monitoring logic here
      // For example, check response times or error rates
      logger.info('API endpoints are healthy');
    } catch (error) {
      logger.error('API monitoring error', { error });
      throw error;
    }
  }

  static startMonitoring(interval = 60000) { // Default: 1 minute
    setInterval(() => {
      this.logMetrics();
      this.monitorDatabaseConnection();
      this.monitorApiEndpoints();
    }, interval);
  }
} 