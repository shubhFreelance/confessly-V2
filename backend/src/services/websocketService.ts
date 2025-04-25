import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Notification } from '../models/Notification';
import { IUser, User } from '../models/User';
import { config } from '../config';

interface ConnectedUser {
  userId: string;
  socketId: string;
  collegeName?: string;
}

class WebSocketService {
  private io: Server;
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'https://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (userId: string) => {
        try {
          const user = await User.findById(userId);
          if (user) {
            this.connectedUsers.set(userId, {
              userId,
              socketId: socket.id,
              collegeName: user.collegeName
            });
            console.log(`User ${userId} authenticated`);
          }
        } catch (error) {
          console.error('Error authenticating user:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const userId = this.findUserIdBySocketId(socket.id);
        if (userId) {
          this.connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });
    });
  }

  private findUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, user] of this.connectedUsers.entries()) {
      if (user.socketId === socketId) {
        return userId;
      }
    }
    return undefined;
  }

  public async sendNotification(notification: any) {
    try {
      const user = this.connectedUsers.get(notification.recipient.toString());
      if (user) {
        this.io.to(user.socketId).emit('notification', {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          createdAt: notification.createdAt
        });
      }
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  public async sendNotificationToUser(userId: string, notification: Partial<Notification>) {
    try {
      const user = this.connectedUsers.get(userId);
      if (user) {
        this.io.to(user.socketId).emit('notification', notification);
      }
    } catch (error) {
      console.error('Error sending real-time notification to user:', error);
    }
  }

  public async broadcastNotification(notification: Partial<Notification>, excludeUserId?: string) {
    try {
      this.io.emit('notification', notification);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  }

  public async sendNotificationToCollege(collegeName: string, notification: Partial<Notification>) {
    try {
      const collegeUsers = Array.from(this.connectedUsers.values())
        .filter(user => user.collegeName === collegeName);

      collegeUsers.forEach(user => {
        this.io.to(user.socketId).emit('notification', notification);
      });
    } catch (error) {
      console.error('Error sending notification to college:', error);
    }
  }
}

export default WebSocketService; 