import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { logger } from '../config/logger';

const execAsync = promisify(exec);

export class BackupService {
  private static backupDir = path.join(__dirname, '../../backups');

  static async initialize() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  static async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
      
      // Create backup directory
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      // Backup MongoDB
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/confessly';
      const dbName = mongoUri.split('/').pop()?.split('?')[0] || 'confessly';
      
      await execAsync(`mongodump --uri="${mongoUri}" --out="${backupPath}"`);

      // Backup uploads
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (fs.existsSync(uploadsDir)) {
        const uploadsBackupDir = path.join(backupPath, 'uploads');
        fs.mkdirSync(uploadsBackupDir, { recursive: true });
        
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
          fs.copyFileSync(
            path.join(uploadsDir, file),
            path.join(uploadsBackupDir, file)
          );
        }
      }

      // Create backup info file
      const backupInfo = {
        timestamp: new Date().toISOString(),
        database: dbName,
        uploads: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0
      };

      fs.writeFileSync(
        path.join(backupPath, 'backup-info.json'),
        JSON.stringify(backupInfo, null, 2)
      );

      logger.info(`Backup created successfully at ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Error creating backup:', error);
      throw error;
    }
  }

  static async restoreBackup(backupPath: string) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup directory not found');
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/confessly';
      
      // Restore MongoDB
      await execAsync(`mongorestore --uri="${mongoUri}" --dir="${backupPath}"`);

      // Restore uploads
      const uploadsBackupDir = path.join(backupPath, 'uploads');
      if (fs.existsSync(uploadsBackupDir)) {
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const files = fs.readdirSync(uploadsBackupDir);
        for (const file of files) {
          fs.copyFileSync(
            path.join(uploadsBackupDir, file),
            path.join(uploadsDir, file)
          );
        }
      }

      logger.info(`Backup restored successfully from ${backupPath}`);
    } catch (error) {
      logger.error('Error restoring backup:', error);
      throw error;
    }
  }

  static async cleanupOldBackups(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days
    try {
      const backups = fs.readdirSync(this.backupDir);
      const now = Date.now();

      for (const backup of backups) {
        const backupPath = path.join(this.backupDir, backup);
        const stats = fs.statSync(backupPath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.rmSync(backupPath, { recursive: true, force: true });
          logger.info(`Deleted old backup: ${backup}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up old backups:', error);
      throw error;
    }
  }
} 