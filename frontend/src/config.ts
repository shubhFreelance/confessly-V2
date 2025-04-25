export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export const DEFAULT_PAGE_SIZE = 10;

export const MAX_COMMENT_LENGTH = 1000;

export const MAX_CONFESSION_LENGTH = 5000;

export const REACTION_TYPES = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'] as const;

export const NOTIFICATION_TYPES = ['confession', 'comment', 'reaction', 'system'] as const;

export const USER_ROLES = ['user', 'moderator', 'admin'] as const;

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const; 