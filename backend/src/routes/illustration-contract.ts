const storyIllustrationProperties = {
  prompt: { type: 'string', minLength: 1, maxLength: 4_000 },
  story_content: { type: 'string', minLength: 1, maxLength: 4_000 },
  characters: { type: 'string', minLength: 1, maxLength: 1_000 },
  setting: { type: 'string', minLength: 1, maxLength: 1_000 },
  mood: { type: 'string', minLength: 1, maxLength: 50 },
  current_scene: { type: 'string', minLength: 1, maxLength: 1_000 },
} as const;

export const generationBodySchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: storyIllustrationProperties,
  anyOf: [{ required: ['prompt'] }, { required: ['story_content'] }],
} as const;

export const webhookIllustrationBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['user_id', 'session_id', 'event_id'],
  properties: {
    user_id: { type: 'string', minLength: 1, maxLength: 128 },
    session_id: { type: 'string', minLength: 1, maxLength: 128 },
    event_id: { type: 'string', minLength: 1, maxLength: 128 },
    ...storyIllustrationProperties,
  },
  anyOf: [{ required: ['prompt'] }, { required: ['story_content'] }],
} as const;
