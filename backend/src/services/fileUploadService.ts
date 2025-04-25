import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF images and MP4 videos are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// File cleanup service
export class FileUploadService {
  static async deleteFile(filename: string) {
    try {
      const filePath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info(`File deleted: ${filename}`);
      }
    } catch (error) {
      logger.error(`Error deleting file ${filename}:`, error);
      throw error;
    }
  }

  static async cleanupUnusedFiles() {
    try {
      const uploadDir = path.join(__dirname, '../../uploads');
      const files = await fs.promises.readdir(uploadDir);
      
      for (const file of files) {
        // Add your logic to check if file is unused
        // For example, check if it's not referenced in any confession
        const filePath = path.join(uploadDir, file);
        const stats = await fs.promises.stat(filePath);
        
        // Delete files older than 24 hours
        if (Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
          await this.deleteFile(file);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up files:', error);
      throw error;
    }
  }
} 