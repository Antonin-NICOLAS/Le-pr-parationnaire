export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isSubscribed: boolean;
  subscriptionEndDate?: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    fullName: string;
    avatarUrl?: string;
  };
  tags: Tag[];
  isPublished: boolean;
  isPremium: boolean;
  viewCount: number;
  tableOfContents?: TableOfContentsItem[];
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'subject' | 'level' | 'type' | 'organization';
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  imageUrl?: string;
  isAffiliate: boolean;
  rating: number;
  price?: string;
  createdAt: string;
}

export interface RevisionSheet {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  theme: string;
  fileUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  downloadCount: number;
  fileSize: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface TwoFactorMethod {
  id: string;
  userId: string;
  type: 'email' | 'authenticator' | 'passkey';
  isEnabled: boolean;
  secret?: string;
  backupCodes?: string[];
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  marketingEmails: boolean;
  language: string;
}