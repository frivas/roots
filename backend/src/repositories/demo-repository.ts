import { demoModeUnavailable } from '../lib/application-error.js';
import type {
  DataRepository,
  IllustrationJobRepository,
  PageRequest,
} from './contracts.js';
import type {
  NotificationRecord,
  ServiceRecord,
  UserSettings,
} from '../types/application.js';

const unavailable = (): never => {
  throw demoModeUnavailable();
};

const services: ServiceRecord[] = [
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Interactive storytelling demonstration',
    isActive: true,
  },
];

export class DemoDataRepository implements DataRepository {
  constructor(private readonly userId: string) {}

  async getCurrentUser() {
    return {
      id: this.userId,
      email: null,
      firstName: null,
      lastName: null,
      role: 'user' as const,
      department: null,
    };
  }

  async listMessages(_page: PageRequest) {
    return { items: [], nextCursor: null };
  }

  async getMessage(_id: string) {
    return null;
  }

  async createMessage(_input: {
    recipientId: string;
    recipient: string;
    subject: string;
    body: string;
  }) {
    return unavailable();
  }

  async markMessageRead(_id: string) {
    return unavailable();
  }

  async deleteMessage(_id: string) {
    return unavailable();
  }

  async listNotifications(_page: PageRequest) {
    return { items: [], nextCursor: null };
  }

  async markNotificationRead(_id: string) {
    return unavailable();
  }

  async markAllNotificationsRead() {
    return unavailable();
  }

  async createNotification(_input: {
    title: string;
    message: string;
    type: NotificationRecord['type'];
    recipientId: string;
  }) {
    return unavailable();
  }

  async getSettings(): Promise<UserSettings> {
    return {
      id: 'demo-settings',
      userId: this.userId,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: false,
      language: 'English',
      timezone: 'UTC',
    };
  }

  async updateSettings(_updates: Partial<Omit<UserSettings, 'id' | 'userId'>>) {
    return unavailable();
  }

  async resetSettings() {
    return unavailable();
  }

  async listServices() {
    return services.map((service) => ({ ...service }));
  }

  async getService(id: string) {
    const service = services.find((candidate) => candidate.id === id);
    return service ? { ...service } : null;
  }
}

export class DemoIllustrationJobRepository
  implements IllustrationJobRepository
{
  async enqueue() {
    return unavailable();
  }

  async getForOwner() {
    return unavailable();
  }

  async markProcessing() {
    return unavailable();
  }

  async markCompleted() {
    return unavailable();
  }

  async markFailed() {
    return unavailable();
  }
}
