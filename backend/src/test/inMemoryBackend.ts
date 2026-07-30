import { randomUUID } from 'node:crypto';
import OpenAI from 'openai';
import type { BackendDependencies } from '../dependencies.js';
import {
  conflict,
  forbidden,
} from '../lib/application-error.js';
import type {
  DataRepository,
  IllustrationJobRepository,
  RepositoryFactory,
} from '../repositories/contracts.js';
import { OpenAIImageProvider } from '../services/illustration-jobs.js';
import { SessionEventRegistry } from '../services/session-events.js';
import type {
  IllustrationJob,
  MessageRecord,
  NotificationRecord,
  ServiceRecord,
  UserProfile,
  UserRole,
  UserSettings,
} from '../types/application.js';

interface SeedMessage {
  id?: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
}

interface InMemoryOptions {
  users?: Array<{ id: string; role: UserRole }>;
  messages?: SeedMessage[];
}

interface State {
  users: Map<string, UserProfile>;
  messages: Map<string, MessageRecord>;
  notifications: Map<string, NotificationRecord>;
  settings: Map<string, UserSettings>;
  services: Map<string, ServiceRecord>;
  jobs: Map<string, IllustrationJob>;
  idempotency: Map<string, string>;
}

const now = () => new Date().toISOString();

const createState = (options: InMemoryOptions): State => ({
  users: new Map(
    (options.users ?? []).map(({ id, role }) => [
      id,
      {
        id,
        email: null,
        firstName: null,
        lastName: null,
        role,
        department: null,
      },
    ]),
  ),
  messages: new Map(
    (options.messages ?? []).map((message) => {
      const id = message.id ?? randomUUID();
      return [
        id,
        {
          ...message,
          id,
          sender: message.senderId,
          recipient: message.recipientId,
          createdAt: now(),
          read: false,
          starred: false,
        },
      ];
    }),
  ),
  notifications: new Map(),
  settings: new Map(),
  services: new Map([
    [
      'storytelling',
      {
        id: 'storytelling',
        name: 'Storytelling',
        description: 'Interactive storytelling',
        isActive: true,
      },
    ],
  ]),
  jobs: new Map(),
  idempotency: new Map(),
});

class InMemoryDataRepository implements DataRepository {
  constructor(
    private readonly state: State,
    private readonly userId: string,
  ) {}

  async getCurrentUser() {
    const existing = this.state.users.get(this.userId);
    if (existing) {
      return existing;
    }
    const created: UserProfile = {
      id: this.userId,
      email: null,
      firstName: null,
      lastName: null,
      role: 'user',
      department: null,
    };
    this.state.users.set(this.userId, created);
    return created;
  }

  async listMessages() {
    return [...this.state.messages.values()].filter(
      (message) =>
        message.senderId === this.userId ||
        message.recipientId === this.userId,
    );
  }

  async getMessage(id: string) {
    const message = this.state.messages.get(id);
    return message &&
      (message.senderId === this.userId ||
        message.recipientId === this.userId)
      ? message
      : null;
  }

  async createMessage(input: {
    recipientId: string;
    recipient: string;
    subject: string;
    body: string;
  }) {
    await this.getCurrentUser();
    if (!this.state.users.has(input.recipientId)) {
      throw conflict();
    }
    const id = randomUUID();
    const message: MessageRecord = {
      id,
      senderId: this.userId,
      recipientId: input.recipientId,
      sender: this.userId,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      createdAt: now(),
      read: false,
      starred: false,
    };
    this.state.messages.set(id, message);
    return message;
  }

  async markMessageRead(id: string) {
    const message = await this.getMessage(id);
    if (!message) {
      return false;
    }
    message.read = true;
    return true;
  }

  async deleteMessage(id: string) {
    const message = await this.getMessage(id);
    return message ? this.state.messages.delete(id) : false;
  }

  async listNotifications() {
    return [...this.state.notifications.values()].filter(
      (notification) => notification.userId === this.userId,
    );
  }

  async markNotificationRead(id: string) {
    const notification = this.state.notifications.get(id);
    if (!notification || notification.userId !== this.userId) {
      return false;
    }
    notification.read = true;
    return true;
  }

  async markAllNotificationsRead() {
    for (const notification of this.state.notifications.values()) {
      if (notification.userId === this.userId) {
        notification.read = true;
      }
    }
  }

  async createNotification(input: {
    title: string;
    message: string;
    type: NotificationRecord['type'];
    recipientId: string;
  }) {
    const actor = await this.getCurrentUser();
    if (input.recipientId !== this.userId && actor.role !== 'admin') {
      throw forbidden();
    }
    if (!this.state.users.has(input.recipientId)) {
      throw conflict();
    }
    const id = randomUUID();
    const notification: NotificationRecord = {
      id,
      title: input.title,
      message: input.message,
      type: input.type,
      timestamp: now(),
      read: false,
      userId: input.recipientId,
    };
    this.state.notifications.set(id, notification);
    return notification;
  }

  async getSettings() {
    const existing = this.state.settings.get(this.userId);
    if (existing) {
      return existing;
    }
    const created: UserSettings = {
      id: randomUUID(),
      userId: this.userId,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: false,
      language: 'English',
      timezone: 'UTC',
    };
    this.state.settings.set(this.userId, created);
    return created;
  }

  async updateSettings(
    updates: Partial<Omit<UserSettings, 'id' | 'userId'>>,
  ) {
    const settings = await this.getSettings();
    Object.assign(settings, updates);
    return settings;
  }

  async resetSettings() {
    const settings = await this.getSettings();
    Object.assign(settings, {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: false,
      language: 'English',
      timezone: 'UTC',
    });
    return settings;
  }

  async listServices() {
    return [...this.state.services.values()].filter(
      (service) => service.isActive,
    );
  }

  async getService(id: string) {
    const service = this.state.services.get(id);
    return service?.isActive ? service : null;
  }
}

class InMemoryIllustrationJobRepository
  implements IllustrationJobRepository
{
  constructor(private readonly state: State) {}

  async enqueue(input: {
    ownerId: string;
    sessionId: string;
    idempotencyKey: string;
    prompt: string;
  }) {
    const key = `${input.ownerId.length}:${input.ownerId}${input.idempotencyKey}`;
    const existingId = this.state.idempotency.get(key);
    if (existingId) {
      return this.state.jobs.get(existingId)!;
    }
    const timestamp = now();
    const job: IllustrationJob = {
      id: randomUUID(),
      ...input,
      status: 'pending',
      imageUrl: null,
      errorCode: null,
      attempts: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.state.jobs.set(job.id, job);
    this.state.idempotency.set(key, job.id);
    return job;
  }

  async getForOwner(jobId: string, ownerId: string) {
    const job = this.state.jobs.get(jobId);
    return job?.ownerId === ownerId ? job : null;
  }

  async markProcessing(jobId: string, ownerId: string) {
    const job = await this.getForOwner(jobId, ownerId);
    if (!job || job.status !== 'pending') {
      return null;
    }
    job.status = 'processing';
    job.attempts += 1;
    job.updatedAt = now();
    return job;
  }

  async markCompleted(jobId: string, ownerId: string, imageUrl: string) {
    const job = await this.getForOwner(jobId, ownerId);
    if (job) {
      job.status = 'completed';
      job.imageUrl = imageUrl;
      job.errorCode = null;
      job.updatedAt = now();
    }
  }

  async markFailed(jobId: string, ownerId: string, errorCode: string) {
    const job = await this.getForOwner(jobId, ownerId);
    if (job) {
      job.status = 'failed';
      job.errorCode = errorCode;
      job.updatedAt = now();
    }
  }
}

export const createInMemoryBackendDependencies = (
  options: InMemoryOptions = {},
) => {
  const state = createState(options);
  const pendingTasks: Array<() => Promise<void>> = [];
  const eventRegistry = new SessionEventRegistry();
  const jobs = new InMemoryIllustrationJobRepository(state);
  const repositories: RepositoryFactory = {
    async data(userId) {
      return new InMemoryDataRepository(state, userId);
    },
    async illustrationJobs() {
      return jobs;
    },
    async trustedIllustrationJobs() {
      return jobs;
    },
  };
  const dependencies: BackendDependencies = {
    repositories,
    illustrationProvider: new OpenAIImageProvider(async () => new OpenAI()),
    eventPublisher: eventRegistry,
    eventRegistry,
    scheduler(task) {
      pendingTasks.push(task);
    },
    readiness: {
      async check() {
        return {
          ready: true,
          checks: {
            clerk: 'ok',
            openai: 'ok',
            supabase: 'ok',
          },
        };
      },
    },
  };

  return {
    dependencies,
    state,
    async drainIllustrationJobs() {
      while (pendingTasks.length > 0) {
        await Promise.all(pendingTasks.splice(0).map((task) => task()));
      }
    },
  };
};
