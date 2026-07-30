import type { SupabaseClient } from '@supabase/supabase-js';
import {
  conflict,
  forbidden,
} from '../lib/application-error.js';
import type {
  IllustrationJob,
  MessageRecord,
  NotificationRecord,
  ServiceRecord,
  UserProfile,
  UserRole,
  UserSettings,
} from '../types/application.js';
import type { Database } from '../types/supabase.js';
import type {
  DataRepository,
  IllustrationJobRepository,
} from './contracts.js';

type Tables = Database['public']['Tables'];

const DEFAULT_SETTINGS = {
  email_notifications: true,
  sms_notifications: false,
  push_notifications: false,
  language: 'English',
  timezone: 'UTC',
} as const;

const knownRoles = new Set<UserRole>([
  'admin',
  'parent',
  'student',
  'teacher',
  'user',
]);

const userProfile = (row: Tables['users']['Row']): UserProfile => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  role: knownRoles.has(row.role as UserRole) ? (row.role as UserRole) : 'user',
  department: row.department,
});

const messageRecord = (row: Tables['messages']['Row']): MessageRecord => ({
  id: row.id,
  senderId: row.sender_id,
  recipientId: row.recipient_id,
  sender: row.sender_id,
  recipient: row.recipient_id,
  subject: row.subject,
  body: row.body,
  createdAt: row.created_at,
  read: row.read,
  starred: row.starred,
});

const notificationRecord = (
  row: Tables['notifications']['Row'],
): NotificationRecord => ({
  id: row.id,
  title: row.title,
  message: row.message,
  timestamp: row.created_at,
  type: row.type as NotificationRecord['type'],
  read: row.read,
  userId: row.user_id,
});

const settingsRecord = (row: Tables['settings']['Row']): UserSettings => ({
  id: row.id,
  userId: row.user_id,
  emailNotifications: row.email_notifications,
  smsNotifications: row.sms_notifications,
  pushNotifications: row.push_notifications,
  language: row.language,
  timezone: row.timezone,
});

const serviceRecord = (row: Tables['services']['Row']): ServiceRecord => ({
  id: row.id,
  name: row.name,
  description: row.description,
  isActive: row.is_active,
});

const illustrationJob = (
  row: Tables['illustration_jobs']['Row'],
): IllustrationJob => ({
  id: row.id,
  ownerId: row.owner_id,
  sessionId: row.session_id,
  idempotencyKey: row.idempotency_key,
  prompt: row.prompt,
  status: row.status,
  imageUrl: row.image_url,
  errorCode: row.error_code,
  attempts: row.attempts,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const throwDataError = (error: { code?: string; message: string }): never => {
  if (error.code === '23503' || error.code === '23505') {
    throw conflict();
  }
  throw new Error(`Supabase data operation failed (${error.code ?? 'unknown'})`);
};

export class SupabaseDataRepository implements DataRepository {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly userId: string,
  ) {}

  private async ensureCurrentUser() {
    const { error } = await this.client
      .from('users')
      .upsert({ id: this.userId }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      throwDataError(error);
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    await this.ensureCurrentUser();
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', this.userId)
      .single();
    if (error) {
      throwDataError(error);
    }
    if (!data) {
      throw new Error('Supabase returned no current user');
    }
    return userProfile(data);
  }

  async listMessages(): Promise<MessageRecord[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      throwDataError(error);
    }
    return (data ?? []).map(messageRecord);
  }

  async getMessage(id: string): Promise<MessageRecord | null> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      throwDataError(error);
    }
    return data ? messageRecord(data) : null;
  }

  async createMessage(input: {
    recipientId: string;
    recipient: string;
    subject: string;
    body: string;
  }): Promise<MessageRecord> {
    await this.ensureCurrentUser();
    const { data, error } = await this.client
      .from('messages')
      .insert({
        sender_id: this.userId,
        recipient_id: input.recipientId,
        subject: input.subject,
        body: input.body,
      })
      .select('*')
      .single();
    if (error) {
      throwDataError(error);
    }
    if (!data) {
      throw new Error('Supabase returned no created message');
    }
    return {
      ...messageRecord(data),
      recipient: input.recipient,
    };
  }

  async markMessageRead(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('messages')
      .update({ read: true })
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) {
      throwDataError(error);
    }
    return data !== null;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('messages')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) {
      throwDataError(error);
    }
    return data !== null;
  }

  async listNotifications(): Promise<NotificationRecord[]> {
    const { data, error } = await this.client
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      throwDataError(error);
    }
    return (data ?? []).map(notificationRecord);
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) {
      throwDataError(error);
    }
    return data !== null;
  }

  async markAllNotificationsRead(): Promise<void> {
    const { error } = await this.client
      .from('notifications')
      .update({ read: true })
      .eq('user_id', this.userId);
    if (error) {
      throwDataError(error);
    }
  }

  async createNotification(input: {
    title: string;
    message: string;
    type: NotificationRecord['type'];
    recipientId: string;
  }): Promise<NotificationRecord> {
    const currentUser = await this.getCurrentUser();
    if (input.recipientId !== this.userId && currentUser.role !== 'admin') {
      throw forbidden();
    }

    const { data, error } = await this.client
      .from('notifications')
      .insert({
        title: input.title,
        message: input.message,
        type: input.type,
        user_id: input.recipientId,
      })
      .select('*')
      .single();
    if (error) {
      throwDataError(error);
    }
    if (!data) {
      throw new Error('Supabase returned no created notification');
    }
    return notificationRecord(data);
  }

  async getSettings(): Promise<UserSettings> {
    const { data, error } = await this.client
      .from('settings')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle();
    if (error) {
      throwDataError(error);
    }
    if (data) {
      return settingsRecord(data);
    }

    const { data: inserted, error: insertError } = await this.client
      .from('settings')
      .insert({ user_id: this.userId, ...DEFAULT_SETTINGS })
      .select('*')
      .single();
    if (insertError) {
      throwDataError(insertError);
    }
    if (!inserted) {
      throw new Error('Supabase returned no inserted settings');
    }
    return settingsRecord(inserted);
  }

  async updateSettings(
    updates: Partial<Omit<UserSettings, 'id' | 'userId'>>,
  ): Promise<UserSettings> {
    await this.getSettings();
    const databaseUpdates: Tables['settings']['Update'] = {
      ...(updates.emailNotifications === undefined
        ? {}
        : { email_notifications: updates.emailNotifications }),
      ...(updates.smsNotifications === undefined
        ? {}
        : { sms_notifications: updates.smsNotifications }),
      ...(updates.pushNotifications === undefined
        ? {}
        : { push_notifications: updates.pushNotifications }),
      ...(updates.language === undefined ? {} : { language: updates.language }),
      ...(updates.timezone === undefined ? {} : { timezone: updates.timezone }),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.client
      .from('settings')
      .update(databaseUpdates)
      .eq('user_id', this.userId)
      .select('*')
      .single();
    if (error) {
      throwDataError(error);
    }
    if (!data) {
      throw new Error('Supabase returned no updated settings');
    }
    return settingsRecord(data);
  }

  async resetSettings(): Promise<UserSettings> {
    await this.getSettings();
    const { data, error } = await this.client
      .from('settings')
      .update({ ...DEFAULT_SETTINGS, updated_at: new Date().toISOString() })
      .eq('user_id', this.userId)
      .select('*')
      .single();
    if (error) {
      throwDataError(error);
    }
    if (!data) {
      throw new Error('Supabase returned no reset settings');
    }
    return settingsRecord(data);
  }

  async listServices(): Promise<ServiceRecord[]> {
    const { data, error } = await this.client
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) {
      throwDataError(error);
    }
    return (data ?? []).map(serviceRecord);
  }

  async getService(id: string): Promise<ServiceRecord | null> {
    const { data, error } = await this.client
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();
    if (error) {
      throwDataError(error);
    }
    return data ? serviceRecord(data) : null;
  }
}

export class SupabaseIllustrationJobRepository
  implements IllustrationJobRepository
{
  constructor(private readonly client: SupabaseClient<Database>) {}

  async enqueue(input: {
    ownerId: string;
    sessionId: string;
    idempotencyKey: string;
    prompt: string;
  }): Promise<IllustrationJob> {
    const { data, error } = await this.client
      .rpc('enqueue_illustration_job', {
        p_owner_id: input.ownerId,
        p_session_id: input.sessionId,
        p_idempotency_key: input.idempotencyKey,
        p_prompt: input.prompt,
      })
      .single();
    if (error) {
      throwDataError(error);
    }
    if (!data) {
      throw new Error('Supabase returned no illustration job');
    }
    return illustrationJob(data);
  }

  async getForOwner(
    jobId: string,
    ownerId: string,
  ): Promise<IllustrationJob | null> {
    const { data, error } = await this.client
      .from('illustration_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('owner_id', ownerId)
      .maybeSingle();
    if (error) {
      throwDataError(error);
    }
    return data ? illustrationJob(data) : null;
  }

  async markProcessing(
    jobId: string,
    ownerId: string,
  ): Promise<IllustrationJob | null> {
    const { data, error } = await this.client
      .from('illustration_jobs')
      .update({
        status: 'processing',
        attempts: 1,
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('owner_id', ownerId)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle();
    if (error) {
      throwDataError(error);
    }
    return data ? illustrationJob(data) : null;
  }

  async markCompleted(
    jobId: string,
    ownerId: string,
    imageUrl: string,
  ): Promise<void> {
    const { error } = await this.client
      .from('illustration_jobs')
      .update({
        status: 'completed',
        image_url: imageUrl,
        error_code: null,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('owner_id', ownerId);
    if (error) {
      throwDataError(error);
    }
  }

  async markFailed(
    jobId: string,
    ownerId: string,
    errorCode: string,
  ): Promise<void> {
    const { error } = await this.client
      .from('illustration_jobs')
      .update({
        status: 'failed',
        error_code: errorCode,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('owner_id', ownerId);
    if (error) {
      throwDataError(error);
    }
  }
}
