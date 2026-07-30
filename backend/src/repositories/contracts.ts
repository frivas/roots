import type {
  IllustrationJob,
  MessageRecord,
  NotificationRecord,
  ServiceRecord,
  UserProfile,
  UserSettings,
} from '../types/application.js';

export interface DataRepository {
  getCurrentUser(): Promise<UserProfile>;
  listMessages(): Promise<MessageRecord[]>;
  getMessage(id: string): Promise<MessageRecord | null>;
  createMessage(input: {
    recipientId: string;
    recipient: string;
    subject: string;
    body: string;
  }): Promise<MessageRecord>;
  markMessageRead(id: string): Promise<boolean>;
  deleteMessage(id: string): Promise<boolean>;
  listNotifications(): Promise<NotificationRecord[]>;
  markNotificationRead(id: string): Promise<boolean>;
  markAllNotificationsRead(): Promise<void>;
  createNotification(input: {
    title: string;
    message: string;
    type: NotificationRecord['type'];
    recipientId: string;
  }): Promise<NotificationRecord>;
  getSettings(): Promise<UserSettings>;
  updateSettings(updates: Partial<Omit<UserSettings, 'id' | 'userId'>>): Promise<UserSettings>;
  resetSettings(): Promise<UserSettings>;
  listServices(): Promise<ServiceRecord[]>;
  getService(id: string): Promise<ServiceRecord | null>;
}

export interface IllustrationJobRepository {
  enqueue(input: {
    ownerId: string;
    sessionId: string;
    idempotencyKey: string;
    prompt: string;
  }): Promise<IllustrationJob>;
  getForOwner(jobId: string, ownerId: string): Promise<IllustrationJob | null>;
  markProcessing(jobId: string, ownerId: string): Promise<IllustrationJob | null>;
  markCompleted(jobId: string, ownerId: string, imageUrl: string): Promise<void>;
  markFailed(jobId: string, ownerId: string, errorCode: string): Promise<void>;
}

export interface RepositoryFactory {
  data(userId: string, getToken: () => Promise<string | null>): Promise<DataRepository>;
  illustrationJobs(
    userId: string,
    getToken: () => Promise<string | null>,
  ): Promise<IllustrationJobRepository>;
  trustedIllustrationJobs(): Promise<IllustrationJobRepository>;
}
