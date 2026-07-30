export type UserRole = 'admin' | 'parent' | 'student' | 'teacher' | 'user';

export interface UserProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  department: string | null;
}
export interface MessageRecord {
  id: string;
  senderId: string;
  recipientId: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  createdAt: string;
  read: boolean;
  starred: boolean;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'error' | 'info' | 'success' | 'warning';
  read: boolean;
  userId: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
}

export interface ServiceRecord {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface IllustrationJob {
  id: string;
  ownerId: string;
  sessionId: string;
  idempotencyKey: string;
  prompt: string;
  status: 'completed' | 'failed' | 'pending' | 'processing';
  imageUrl: string | null;
  errorCode: string | null;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}
