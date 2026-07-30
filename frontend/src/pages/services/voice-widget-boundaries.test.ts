import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const voicePages = [
  'ParentWellnessChat',
  'ProgressInterpretationChat',
  'LanguageLessonSession',
  'MathTutoringSession',
  'ChessCoachingSession',
  'ExtraCurricularSession',
  'StorytellingSession',
];

describe('voice assistant page boundaries', () => {
  it.each(voicePages)('%s delegates loading and cleanup to ElevenLabsWidget', page => {
    const source = readFileSync(
      resolve(process.cwd(), `src/pages/services/${page}.tsx`),
      'utf8',
    );

    expect(source).toContain('ElevenLabsWidget');
    expect(source).not.toContain('setInterval(');
    expect(source).not.toMatch(/document\.querySelector\([^)]*widget/);
    expect(source).not.toContain('WIDGET_CONFIG.SCRIPT_SRC');
  });
});
