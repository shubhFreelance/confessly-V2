interface NotificationTemplate {
  title: string;
  message: string;
  type: 'confession' | 'comment' | 'like' | 'system';
  data?: any;
}

export interface TemplateData {
  username?: string;
  confessionId?: string;
  confessionTitle?: string;
  commentId?: string;
  commentText?: string;
  collegeName?: string;
  [key: string]: any;
}

const templates: { [key: string]: (data: TemplateData) => NotificationTemplate } = {
  // Confession Templates
  newConfession: (data) => ({
    title: 'New Confession',
    message: `${data.username} posted a new confession: "${data.confessionTitle}"`,
    type: 'confession',
    data: {
      confessionId: data.confessionId,
      action: 'view'
    }
  }),

  confessionLiked: (data) => ({
    title: 'Confession Liked',
    message: `${data.username} liked your confession: "${data.confessionTitle}"`,
    type: 'like',
    data: {
      confessionId: data.confessionId,
      action: 'view'
    }
  }),

  // Comment Templates
  newComment: (data) => ({
    title: 'New Comment',
    message: `${data.username} commented on your confession: "${data.commentText}"`,
    type: 'comment',
    data: {
      confessionId: data.confessionId,
      commentId: data.commentId,
      action: 'view'
    }
  }),

  commentLiked: (data) => ({
    title: 'Comment Liked',
    message: `${data.username} liked your comment: "${data.commentText}"`,
    type: 'like',
    data: {
      confessionId: data.confessionId,
      commentId: data.commentId,
      action: 'view'
    }
  }),

  // System Templates
  welcomeMessage: (data) => ({
    title: 'Welcome to Confessly!',
    message: `Welcome ${data.username}! Start sharing your confessions with your college community.`,
    type: 'system',
    data: {
      action: 'explore'
    }
  }),

  collegeAnnouncement: (data) => ({
    title: 'College Announcement',
    message: `New announcement for ${data.collegeName}: ${data.message}`,
    type: 'system',
    data: {
      action: 'view_announcement'
    }
  }),

  subscriptionExpiring: (data) => ({
    title: 'Subscription Expiring',
    message: `Your ${data.tier} subscription will expire in ${data.daysLeft} days. Renew now to continue enjoying premium features!`,
    type: 'system',
    data: {
      action: 'renew_subscription'
    }
  }),

  // Achievement Templates
  achievementUnlocked: (data) => ({
    title: 'Achievement Unlocked!',
    message: `Congratulations! You've unlocked the "${data.achievementName}" achievement.`,
    type: 'system',
    data: {
      action: 'view_achievement',
      achievementId: data.achievementId
    }
  }),

  // Ranking Templates
  rankingUpdate: (data) => ({
    title: 'Ranking Update',
    message: `Your weekly rank has been updated! You are now ranked #${data.rank} in your college.`,
    type: 'system',
    data: {
      action: 'view_rankings'
    }
  })
};

export const getNotificationTemplate = (templateName: string, data: TemplateData): NotificationTemplate => {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Notification template "${templateName}" not found`);
  }
  return template(data);
};

export const getAvailableTemplates = (): string[] => {
  return Object.keys(templates);
}; 