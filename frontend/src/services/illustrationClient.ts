export interface StoryIllustrationInput {
  story_content: string;
  characters?: string;
  setting?: string;
  mood?: string;
  current_scene?: string;
}

interface IllustrationJob {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  errorCode?: string;
  statusUrl?: string;
}

interface IllustrationClientOptions {
  getToken: () => Promise<string | null>;
  baseUrl?: string;
  fetcher?: typeof fetch;
  pollIntervalMs?: number;
  maxPollAttempts?: number;
  recoveryAfterPendingPolls?: number;
  wait?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
}

export interface IllustrationClient {
  generate(
    input: StoryIllustrationInput,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<string>;
}

const DEFAULT_POLL_INTERVAL_MS = 1_000;
const DEFAULT_MAX_POLL_ATTEMPTS = 60;
const DEFAULT_RECOVERY_AFTER_PENDING_POLLS = 5;

const waitFor = (milliseconds: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const handleAbort = () => {
      window.clearTimeout(timeout);
      reject(signal?.reason);
    };
    const timeout = window.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener('abort', handleAbort, { once: true });
  });

const parseJob = async (response: Response): Promise<IllustrationJob> => {
  if (!response.ok) {
    throw new Error('Image generation request failed');
  }

  const value: unknown = await response.json();
  if (!value || typeof value !== 'object' || !('status' in value)) {
    throw new Error('Image generation returned an invalid job');
  }

  const job = value as IllustrationJob;
  if (!['pending', 'processing', 'completed', 'failed'].includes(job.status)) {
    throw new Error('Image generation returned an invalid job status');
  }
  return job;
};

const completedImage = (job: IllustrationJob) => {
  if (job.status === 'failed') {
    throw new Error(job.errorCode || 'Image generation failed');
  }
  if (job.status === 'completed') {
    if (!job.imageUrl) throw new Error('Completed image job has no image URL');
    return job.imageUrl;
  }
  return null;
};

export const createIllustrationClient = ({
  getToken,
  baseUrl = import.meta.env.VITE_BACKEND_URL,
  fetcher = fetch,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxPollAttempts = DEFAULT_MAX_POLL_ATTEMPTS,
  recoveryAfterPendingPolls = DEFAULT_RECOVERY_AFTER_PENDING_POLLS,
  wait = waitFor,
}: IllustrationClientOptions): IllustrationClient => {
  if (!Number.isInteger(recoveryAfterPendingPolls) || recoveryAfterPendingPolls < 1) {
    throw new Error('Recovery polling threshold must be a positive integer');
  }
  const requests = new Map<string, Promise<string>>();
  const backendOrigin = new URL(baseUrl || window.location.origin, window.location.origin);
  const generationUrl = new URL('/api/images/generate-for-story', backendOrigin);

  const execute = async (
    input: StoryIllustrationInput,
    idempotencyKey: string,
    signal?: AbortSignal,
  ) => {
    const token = await getToken();
    if (!token) throw new Error('Authentication is required to create an illustration');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    };
    const queued = await parseJob(await fetcher(generationUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      signal,
    }));
    const immediateImage = completedImage(queued);
    if (immediateImage) return immediateImage;
    if (!queued.statusUrl) throw new Error('Image generation job has no status URL');

    const statusUrl = new URL(queued.statusUrl, backendOrigin);
    if (statusUrl.origin !== backendOrigin.origin) {
      throw new Error('Image generation job returned an untrusted status URL');
    }
    const recoveryUrl = new URL(
      `${statusUrl.pathname.replace(/\/$/, '')}/recover`,
      statusUrl,
    );
    let consecutivePendingPolls = 0;
    let recoveryAttempted = false;

    for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
      await wait(pollIntervalMs, signal);
      const job = await parseJob(await fetcher(statusUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        signal,
      }));
      const imageUrl = completedImage(job);
      if (imageUrl) return imageUrl;

      consecutivePendingPolls =
        job.status === 'pending' ? consecutivePendingPolls + 1 : 0;
      if (
        consecutivePendingPolls >= recoveryAfterPendingPolls
        && !recoveryAttempted
      ) {
        recoveryAttempted = true;
        const recovered = await parseJob(await fetcher(recoveryUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          signal,
        }));
        const recoveredImage = completedImage(recovered);
        if (recoveredImage) return recoveredImage;
        consecutivePendingPolls = 0;
      }
    }

    throw new Error('Image generation timed out');
  };

  return {
    generate(input, idempotencyKey, signal) {
      const normalizedKey = idempotencyKey.trim();
      if (!normalizedKey || normalizedKey.length > 128) {
        return Promise.reject(new Error('Illustration idempotency key is invalid'));
      }

      const existing = requests.get(normalizedKey);
      if (existing) return existing;

      const request = execute(input, normalizedKey, signal).catch((error) => {
        requests.delete(normalizedKey);
        throw error;
      });
      requests.set(normalizedKey, request);
      return request;
    },
  };
};

const hashTurn = (value: string) => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

export const createStoryTurnIdempotencyKey = (
  sessionId: string,
  turnIdentity: string,
) => `story-${sessionId.slice(0, 48)}-${hashTurn(turnIdentity.trim().toLowerCase())}`;

const EXPLICIT_ILLUSTRATION_PATTERNS = [
  /\b(?:draw|paint|sketch|illustrate)\b/i,
  /\b(?:create|make|generate|show me)\b.{0,40}\b(?:picture|image|illustration|drawing)\b/i,
  /\b(?:dibuja|dibujar|pinta|pintar|ilustra|ilustrar)\b/i,
  /\b(?:crea|crear|haz|hacer|muéstrame)\b.{0,40}\b(?:imagen|ilustración|dibujo)\b/i,
  /(?:画|绘画|插图|创建图像|做个图|给我看)/i,
  /(?:намалюй|малювати|зроби картинку|створи зображення)/i,
  /(?:desenează|poți desena|fă o imagine|creează o imagine)/i,
];

export const isExplicitIllustrationRequest = (text: string) => {
  const rejectsIllustration =
    /\b(?:do not|don't|dont|never|stop|no)\b.{0,30}\b(?:draw|paint|sketch|illustrate|picture|image|illustration|drawing)\b/i
      .test(text)
    || /\b(?:no|nunca|deja de)\b.{0,30}\b(?:dibujar|pintar|ilustrar|imagen|ilustración|dibujo)\b/i
      .test(text);
  return !rejectsIllustration
    && EXPLICIT_ILLUSTRATION_PATTERNS.some((pattern) => pattern.test(text));
};

export const isIllustrationOffer = (text: string) =>
  /\b(?:would you like|shall i|should i|do you want)\b.{0,60}\b(?:illustration|picture|image|drawing)\b/i.test(text)
  || /\b(?:quieres|te gustaría)\b.{0,60}\b(?:ilustración|imagen|dibujo)\b/i.test(text);

export const isPositiveIllustrationResponse = (text: string) =>
  /^(?:yes|yeah|yep|sure|okay|ok|please|absolutely|go ahead|sí|si|claro|por favor|vale|adelante|好|好的|是|так|добре|da|desigur)[.! ]*$/i
    .test(text.trim());

export const createConversationEndGuard = () => {
  let ended = false;
  return {
    noteActivity() {
      ended = false;
    },
    end(onFirstEnd: () => void) {
      if (ended) return false;
      ended = true;
      onFirstEnd();
      return true;
    },
  };
};

export const appendRecentStoryTurn = (
  turns: readonly string[],
  role: 'agent' | 'user',
  text: string,
) => {
  const next = [...turns, `${role}: ${text.trim()}`].slice(-12);
  while (next.join('\n').length > 4_000 && next.length > 1) next.shift();
  return next;
};
