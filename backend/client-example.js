// Client-side WebSocket connection example
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: false
});

// Connect to WebSocket server
socket.connect();

// Authenticate user after login
function authenticateUser(userId) {
  socket.emit('authenticate', userId);
}

// Listen for notifications
socket.on('notification', (notification) => {
  console.log('New notification received:', notification);
  
  // Handle different types of notifications
  switch (notification.type) {
    case 'confession':
      handleConfessionNotification(notification);
      break;
    case 'comment':
      handleCommentNotification(notification);
      break;
    case 'like':
      handleLikeNotification(notification);
      break;
    case 'system':
      handleSystemNotification(notification);
      break;
    default:
      console.log('Unknown notification type:', notification.type);
  }
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Example notification handlers
function handleConfessionNotification(notification) {
  // Show notification in UI
  showNotification(notification);
  
  // Update confession list if needed
  if (notification.data?.confessionId) {
    updateConfessionList(notification.data.confessionId);
  }
}

function handleCommentNotification(notification) {
  // Show notification in UI
  showNotification(notification);
  
  // Update comment section if needed
  if (notification.data?.confessionId) {
    updateCommentSection(notification.data.confessionId);
  }
}

function handleLikeNotification(notification) {
  // Show notification in UI
  showNotification(notification);
  
  // Update like count if needed
  if (notification.data?.confessionId) {
    updateLikeCount(notification.data.confessionId);
  }
}

function handleSystemNotification(notification) {
  // Show system notification in UI
  showSystemNotification(notification);
}

// UI helper functions
function showNotification(notification) {
  // Create notification element
  const notificationElement = document.createElement('div');
  notificationElement.className = 'notification';
  notificationElement.innerHTML = `
    <h3>${notification.title}</h3>
    <p>${notification.message}</p>
    <small>${new Date(notification.createdAt).toLocaleString()}</small>
  `;
  
  // Add to notification container
  const container = document.getElementById('notifications-container');
  container.appendChild(notificationElement);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}

function showSystemNotification(notification) {
  // Show system notification (e.g., using toast or alert)
  alert(`${notification.title}: ${notification.message}`);
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
  // After user login
  const userId = 'user123'; // Get this from your auth system
  authenticateUser(userId);
}); 