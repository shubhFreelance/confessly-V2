import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import {
  addReaction,
  incrementComments,
  updateConfession,
} from '../store/slices/confessionSlice';
import { addNotification } from '../store/slices/notificationSlice';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  initialize(token: string) {
    this.token = token;
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    // Confession events
    this.socket.on('confession:created', (confession) => {
      store.dispatch(updateConfession(confession));
    });

    this.socket.on('confession:updated', (confession) => {
      store.dispatch(updateConfession(confession));
    });

    this.socket.on('confession:deleted', (confessionId) => {
      // Handle confession deletion
    });

    // Reaction events
    this.socket.on('reaction:added', ({ confessionId, reaction }) => {
      store.dispatch(addReaction({ confessionId, reaction }));
    });

    // Comment events
    this.socket.on('comment:added', ({ confessionId }) => {
      store.dispatch(incrementComments(confessionId));
    });

    // Notification events
    this.socket.on('notification:new', (notification) => {
      store.dispatch(addNotification(notification));
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Emit events
  emitConfessionCreated(confession: any) {
    this.socket?.emit('confession:create', confession);
  }

  emitConfessionUpdated(confession: any) {
    this.socket?.emit('confession:update', confession);
  }

  emitConfessionDeleted(confessionId: string) {
    this.socket?.emit('confession:delete', confessionId);
  }

  emitReactionAdded(confessionId: string, reactionType: string) {
    this.socket?.emit('reaction:add', { confessionId, reactionType });
  }

  emitCommentAdded(confessionId: string, comment: any) {
    this.socket?.emit('comment:add', { confessionId, comment });
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
    }
  }
}

export const socketService = new SocketService(); 