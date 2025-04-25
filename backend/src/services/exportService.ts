import { UserBehavior, ContentPerformance, SystemPerformance } from '../models/Analytics';
import { User } from '../models/User';
import { Confession } from '../models/Confession';
import ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  startDate?: Date;
  endDate?: Date;
  type: 'user-behavior' | 'content-performance' | 'system-performance' | 'all';
}

export class ExportService {
  private static async ensureExportDirectory() {
    const exportDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    return exportDir;
  }

  private static async exportToCSV(data: any[], fields: any[], filename: string) {
    const exportDir = await this.ensureExportDirectory();
    const filePath = path.join(exportDir, `${filename}.csv`);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: fields
    });

    await csvWriter.writeRecords(data);
    return filePath;
  }

  private static async exportToExcel(data: any[], fields: any[], filename: string) {
    const exportDir = await this.ensureExportDirectory();
    const filePath = path.join(exportDir, `${filename}.xlsx`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers
    worksheet.columns = fields.map(field => ({
      header: field.label,
      key: field.value,
      width: 20
    }));

    // Add rows
    worksheet.addRows(data);

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  private static async exportToJSON(data: any[], filename: string) {
    const exportDir = await this.ensureExportDirectory();
    const filePath = path.join(exportDir, `${filename}.json`);

    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return filePath;
  }

  public static async exportUserBehavior(options: ExportOptions) {
    const query: any = {};
    if (options.startDate || options.endDate) {
      query.timestamp = {};
      if (options.startDate) query.timestamp.$gte = options.startDate;
      if (options.endDate) query.timestamp.$lte = options.endDate;
    }

    const behaviors = await UserBehavior.find(query)
      .populate('userId', 'username')
      .sort({ timestamp: -1 });

    const fields = [
      { label: 'User ID', value: 'userId' },
      { label: 'Username', value: 'userId.username' },
      { label: 'Action', value: 'action' },
      { label: 'Target Type', value: 'targetType' },
      { label: 'Target ID', value: 'targetId' },
      { label: 'Page', value: 'metadata.page' },
      { label: 'Device Type', value: 'metadata.deviceType' },
      { label: 'Browser', value: 'metadata.browser' },
      { label: 'OS', value: 'metadata.os' },
      { label: 'IP', value: 'metadata.ip' },
      { label: 'Location', value: 'metadata.location' },
      { label: 'Duration', value: 'metadata.duration' },
      { label: 'Timestamp', value: 'timestamp' }
    ];

    const filename = `user-behavior-${new Date().toISOString()}`;

    switch (options.format) {
      case 'csv':
        return await this.exportToCSV(behaviors, fields, filename);
      case 'excel':
        return await this.exportToExcel(behaviors, fields, filename);
      case 'json':
        return await this.exportToJSON(behaviors, filename);
      default:
        throw new Error('Unsupported export format');
    }
  }

  public static async exportContentPerformance(options: ExportOptions) {
    const query: any = {};
    if (options.startDate || options.endDate) {
      query.lastUpdated = {};
      if (options.startDate) query.lastUpdated.$gte = options.startDate;
      if (options.endDate) query.lastUpdated.$lte = options.endDate;
    }

    const performances = await ContentPerformance.find(query)
      .sort({ lastUpdated: -1 });

    const fields = [
      { label: 'Content ID', value: 'contentId' },
      { label: 'Content Type', value: 'contentType' },
      { label: 'Views', value: 'metrics.views' },
      { label: 'Unique Views', value: 'metrics.uniqueViews' },
      { label: 'Likes', value: 'metrics.likes' },
      { label: 'Comments', value: 'metrics.comments' },
      { label: 'Shares', value: 'metrics.shares' },
      { label: 'Average View Duration', value: 'metrics.averageViewDuration' },
      { label: 'Engagement Rate', value: 'metrics.engagementRate' },
      { label: 'Last Updated', value: 'lastUpdated' }
    ];

    const filename = `content-performance-${new Date().toISOString()}`;

    switch (options.format) {
      case 'csv':
        return await this.exportToCSV(performances, fields, filename);
      case 'excel':
        return await this.exportToExcel(performances, fields, filename);
      case 'json':
        return await this.exportToJSON(performances, filename);
      default:
        throw new Error('Unsupported export format');
    }
  }

  public static async exportSystemPerformance(options: ExportOptions) {
    const query: any = {};
    if (options.startDate || options.endDate) {
      query.timestamp = {};
      if (options.startDate) query.timestamp.$gte = options.startDate;
      if (options.endDate) query.timestamp.$lte = options.endDate;
    }

    const performances = await SystemPerformance.find(query)
      .sort({ timestamp: -1 });

    const fields = [
      { label: 'Timestamp', value: 'timestamp' },
      { label: 'CPU Usage', value: 'metrics.cpuUsage' },
      { label: 'Memory Usage', value: 'metrics.memoryUsage' },
      { label: 'Active Users', value: 'metrics.activeUsers' },
      { label: 'Requests Per Minute', value: 'metrics.requestsPerMinute' },
      { label: 'Average Response Time', value: 'metrics.averageResponseTime' },
      { label: 'Error Rate', value: 'metrics.errorRate' },
      { label: 'Database Connections', value: 'metrics.databaseConnections' },
      { label: 'Cache Hit Rate', value: 'metrics.cacheHitRate' }
    ];

    const filename = `system-performance-${new Date().toISOString()}`;

    switch (options.format) {
      case 'csv':
        return await this.exportToCSV(performances, fields, filename);
      case 'excel':
        return await this.exportToExcel(performances, fields, filename);
      case 'json':
        return await this.exportToJSON(performances, filename);
      default:
        throw new Error('Unsupported export format');
    }
  }

  public static async exportAll(options: ExportOptions) {
    const [userBehavior, contentPerformance, systemPerformance] = await Promise.all([
      this.exportUserBehavior(options),
      this.exportContentPerformance(options),
      this.exportSystemPerformance(options)
    ]);

    return {
      userBehavior,
      contentPerformance,
      systemPerformance
    };
  }
} 