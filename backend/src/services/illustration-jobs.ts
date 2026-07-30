import { createHash } from 'node:crypto';
import type OpenAI from 'openai';
import type { FastifyBaseLogger } from 'fastify';
import type { IllustrationJobRepository } from '../repositories/contracts.js';
import type { IllustrationJob } from '../types/application.js';

export interface StoryIllustrationInput {
  prompt?: string;
  story_content?: string;
  characters?: string;
  setting?: string;
  mood?: string;
  current_scene?: string;
}

export interface IllustrationEventPublisher {
  publish(
    ownerId: string,
    sessionId: string,
    event: {
      type: 'illustration-completed' | 'illustration-failed';
      jobId: string;
      imageUrl?: string;
      errorCode?: string;
    },
  ): void;
}

export interface IllustrationProvider {
  generate(prompt: string): Promise<string>;
}

export type JobScheduler = (task: () => Promise<void>) => void;

const MOOD_STYLES: Record<string, string> = {
  adventurous: 'dynamic composition, exciting landscape, bold colors',
  cheerful: 'warm colors, pleasant lighting, joyful expressions',
  happy: 'bright cheerful colors, sunny atmosphere, smiling characters',
  magical: 'sparkles, glowing effects, enchanted atmosphere',
  sad: 'soft muted colors, gentle expressions, comforting atmosphere',
  scary: 'dramatic lighting and mysterious shadows while remaining child-safe',
};

export const buildIllustrationPrompt = (input: StoryIllustrationInput) => {
  if (input.prompt?.trim()) {
    return input.prompt.trim();
  }

  const mood = input.mood?.trim().toLowerCase() || 'cheerful';
  const moodStyle = MOOD_STYLES[mood] ?? MOOD_STYLES.cheerful;
  const characters = input.characters?.trim() || 'charming storybook characters';
  const setting = input.setting?.trim() || 'a magical storybook world';
  const scene =
    input.current_scene?.trim().slice(0, 500) ||
    input.story_content?.trim().slice(0, 500) ||
    'an engaging story scene';

  return [
    "Children's book illustration, vibrant friendly cartoon style",
    moodStyle,
    `set in ${setting}`,
    `featuring ${characters}`,
    `showing ${scene}`,
    'safe and wholesome content for children ages 4-10',
  ].join(', ');
};

export const deriveIdempotencyKey = (
  ownerId: string,
  sessionId: string,
  prompt: string,
  suppliedKey?: string,
) => {
  if (suppliedKey?.trim()) {
    return suppliedKey.trim();
  }
  return createHash('sha256')
    .update(`${ownerId}\0${sessionId}\0${prompt}`)
    .digest('hex');
};

export class OpenAIImageProvider implements IllustrationProvider {
  constructor(private readonly getClient: () => Promise<OpenAI>) {}

  async generate(prompt: string): Promise<string> {
    const client = await this.getClient();
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    });
    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('IMAGE_PROVIDER_EMPTY_RESULT');
    }
    return imageUrl;
  }
}

export class IllustrationJobService {
  constructor(
    private readonly repository: IllustrationJobRepository,
    private readonly provider: IllustrationProvider,
    private readonly publisher: IllustrationEventPublisher,
    private readonly scheduler: JobScheduler,
    private readonly logger: FastifyBaseLogger,
  ) {}

  async enqueue(input: {
    ownerId: string;
    sessionId: string;
    idempotencyKey: string;
    prompt: string;
  }): Promise<IllustrationJob> {
    const job = await this.repository.enqueue(input);
    if (job.status === 'pending') {
      this.scheduler(() => this.process(job.id, input.ownerId));
    }
    return job;
  }

  async get(jobId: string, ownerId: string): Promise<IllustrationJob | null> {
    return this.repository.getForOwner(jobId, ownerId);
  }

  async recover(
    jobId: string,
    ownerId: string,
  ): Promise<IllustrationJob | null> {
    const job = await this.repository.getForOwner(jobId, ownerId);
    if (!job || job.status !== 'pending') {
      return job;
    }
    const claimed = await this.repository.markProcessing(job.id, ownerId);
    if (!claimed) {
      return this.repository.getForOwner(jobId, ownerId);
    }
    this.scheduler(() => this.processClaimed(claimed, ownerId));
    return claimed;
  }

  private async process(jobId: string, ownerId: string) {
    const job = await this.repository.markProcessing(jobId, ownerId);
    if (!job) {
      return;
    }
    await this.processClaimed(job, ownerId);
  }

  private async processClaimed(job: IllustrationJob, ownerId: string) {
    try {
      const imageUrl = await this.provider.generate(job.prompt);
      await this.repository.markCompleted(job.id, ownerId, imageUrl);
      this.publisher.publish(ownerId, job.sessionId, {
        type: 'illustration-completed',
        jobId: job.id,
        imageUrl,
      });
    } catch {
      this.logger.error(
        { jobId: job.id, provider: 'openai' },
        'illustration job failed',
      );
      await this.repository.markFailed(
        job.id,
        ownerId,
        'IMAGE_GENERATION_FAILED',
      );
      this.publisher.publish(ownerId, job.sessionId, {
        type: 'illustration-failed',
        jobId: job.id,
        errorCode: 'IMAGE_GENERATION_FAILED',
      });
    }
  }
}
