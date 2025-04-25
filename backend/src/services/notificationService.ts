import { User } from '../models/User';
import { Notification } from '../models/Notification';
import nodemailer from 'nodemailer';
import { config } from '../config';
import WebSocketService from './websocketService';
import { getNotificationTemplate, TemplateData } from '../templates/notificationTemplates';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass
  }
});

interface NotificationData {
  recipient: mongoose.Types.ObjectId | string;
  type: 'confession' | 'comment' | 'like' | 'system';
  title?: string;
  confession?: mongoose.Types.ObjectId | string;
  comment?: mongoose.Types.ObjectId | string;
  actor?: mongoose.Types.ObjectId | string;
  message: string;
  data?: any;
}

let websocketService: WebSocketService;

export const initializeWebSocket = (server: any) => {
  websocketService = new WebSocketService(server);
};

export const createNotificationFromTemplate = async (
  templateName: string,
  recipientId: string,
  templateData: TemplateData
) => {
  try {
    const template = getNotificationTemplate(templateName, templateData);
    return await createNotification({
      recipient: recipientId,
      ...template
    });
  } catch (error) {
    console.error('Error creating notification from template:', error);
    throw error;
  }
};

export const createNotification = async (data: NotificationData) => {
  try {
    const notification = new Notification({
      recipient: typeof data.recipient === 'string' ? new mongoose.Types.ObjectId(data.recipient) : data.recipient,
      type: data.type,
      confession: data.confession ? (typeof data.confession === 'string' ? new mongoose.Types.ObjectId(data.confession) : data.confession) : undefined,
      comment: data.comment ? (typeof data.comment === 'string' ? new mongoose.Types.ObjectId(data.comment) : data.comment) : undefined,
      actor: data.actor ? (typeof data.actor === 'string' ? new mongoose.Types.ObjectId(data.actor) : data.actor) : undefined,
      message: data.message,
      isRead: false
    });

    await notification.save();

    // Send email notification if user has email notifications enabled
    const user = await User.findById(data.recipient);
    if (user?.preferences?.emailNotifications) {
      await sendEmailNotification(user.email, data.title || 'New Notification', data.message);
    }

    // Send real-time notification
    if (websocketService) {
      await websocketService.sendNotification(notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const sendEmailNotification = async (email: string, subject: string, message: string) => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject,
      text: message,
      html: `<div>${message}</div>`
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId: string, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return {
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      unreadCount
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string, userId: string) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.deleteOne();
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export class NotificationService {
  private static io: Server;

  static setSocketIO(socketIO: Server) {
    NotificationService.io = socketIO;
  }

  static async create(data: NotificationData) {
    try {
      const notification = new Notification({
        recipient: typeof data.recipient === 'string' ? new mongoose.Types.ObjectId(data.recipient) : data.recipient,
        type: data.type,
        confession: data.confession ? (typeof data.confession === 'string' ? new mongoose.Types.ObjectId(data.confession) : data.confession) : undefined,
        comment: data.comment ? (typeof data.comment === 'string' ? new mongoose.Types.ObjectId(data.comment) : data.comment) : undefined,
        actor: data.actor ? (typeof data.actor === 'string' ? new mongoose.Types.ObjectId(data.actor) : data.actor) : undefined,
        message: data.message,
        isRead: false
      });

      await notification.save();

      // Emit socket event if IO is set up
      if (NotificationService.io) {
        NotificationService.io.to(notification.recipient.toString()).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      throw error;
    }
  }

  static async getUnreadCount(userId: mongoose.Types.ObjectId | string) {
    try {
      const recipientId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
      return await Notification.countDocuments({
        recipient: recipientId,
        isRead: false
      });
    } catch (error) {
      throw error;
    }
  }

  static async markAsRead(notificationId: mongoose.Types.ObjectId | string) {
    try {
      const id = typeof notificationId === 'string' ? new mongoose.Types.ObjectId(notificationId) : notificationId;
      const notification = await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      throw error;
    }
  }

  static async markAllAsRead(userId: mongoose.Types.ObjectId | string) {
    try {
      const recipientId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
      await Notification.updateMany(
        { recipient: recipientId, isRead: false },
        { isRead: true }
      );
    } catch (error) {
      throw error;
    }
  }

  static async getUserNotifications(userId: mongoose.Types.ObjectId | string, page = 1, limit = 10) {
    try {
      const recipientId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
      const skip = (page - 1) * limit;
      const notifications = await Notification.find({ recipient: recipientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'username')
        .populate('confession', 'content')
        .populate('comment', 'content');

      const total = await Notification.countDocuments({ recipient: recipientId });

      return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  static async deleteNotification(notificationId: mongoose.Types.ObjectId | string) {
    try {
      const id = typeof notificationId === 'string' ? new mongoose.Types.ObjectId(notificationId) : notificationId;
      await Notification.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  static async deleteAllNotifications(userId: mongoose.Types.ObjectId | string) {
    try {
      const recipientId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
      await Notification.deleteMany({ recipient: recipientId });
    } catch (error) {
      throw error;
    }
  }
} 