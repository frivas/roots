import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import AiAccuracyNotice from '../../components/AiAccuracyNotice';
import ElevenLabsWidget from '../../components/ElevenLabsWidget';
import TranslatedText from '../../components/TranslatedText';
import Button from '../../components/ui/Button';
import PaintingSpinner from '../../components/ui/PaintingSpinner';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import useTranslatedString from '../../hooks/useTranslatedString';
import {
  appendRecentStoryTurn,
  createConversationEndGuard,
  createIllustrationClient,
  createStoryTurnIdempotencyKey,
  isExplicitIllustrationRequest,
  isIllustrationOffer,
  isPositiveIllustrationResponse,
  type StoryIllustrationInput,
} from '../../services/illustrationClient';

interface WidgetResponseDetail {
  id?: string;
  messageId?: string;
  text?: string;
}

const createSessionId = () =>
  globalThis.crypto?.randomUUID?.()
  ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const analyzeStory = (
  turns: readonly string[],
): StoryIllustrationInput => {
  const storyContent = turns.join('\n').slice(-4_000);
  const lowerContent = storyContent.toLowerCase();
  const moodRules: Array<[string, string[]]> = [
    ['magical', ['magic', 'enchanted', 'fairy', 'wizard', 'sparkle']],
    ['adventurous', ['adventure', 'journey', 'quest', 'brave', 'explore']],
    ['happy', ['happy', 'joy', 'laugh', 'smile', 'celebration']],
    ['sad', ['sad', 'cry', 'lonely', 'lost', 'worried']],
    ['scary', ['dark', 'scary', 'monster', 'ghost', 'thunder']],
  ];
  const mood = moodRules.find(([, keywords]) =>
    keywords.some((keyword) => lowerContent.includes(keyword)),
  )?.[0] ?? 'cheerful';
  const characterMatches = storyContent.match(
    /\b(?:princess|prince|king|queen|knight|dragon|fairy|witch|wizard|bear|wolf|rabbit|fox|cat|dog|bird|mouse)\b/gi,
  ) ?? [];
  const characters = [...new Set(characterMatches.map((name) => name.toLowerCase()))]
    .slice(0, 3)
    .join(', ');
  const settingMatch = storyContent.match(
    /\b(?:castle|forest|village|mountain|river|lake|sea|cave|house|cottage|palace|garden|meadow|bridge)\b/i,
  );
  const currentScene = turns[turns.length - 1]
    ?.replace(/^(?:agent|user):\s*/, '')
    .slice(0, 500);

  return {
    story_content: storyContent,
    characters: characters || 'charming storybook characters',
    setting: settingMatch?.[0] || 'a magical storybook world',
    mood,
    current_scene: currentScene || 'the beginning of an adventure',
  };
};

const StorytellingSession: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { language } = useLingoTranslation();
  const storyIllustrationAlt = useTranslatedString('Story illustration');
  const downloadIllustrationTitle = useTranslatedString('Download Illustration');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [hasStoryContent, setHasStoryContent] = useState(false);
  const [isWaitingForDrawingResponse, setIsWaitingForDrawingResponse] = useState(false);
  const recentTurnsRef = useRef<string[]>([]);
  const agentTurnRef = useRef(0);
  const manualTurnRef = useRef(0);
  const conversationEndGuardRef = useRef(createConversationEndGuard());
  const isGeneratingImageRef = useRef(false);
  const isWaitingForDrawingResponseRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef(createSessionId());
  const illustrationClient = useMemo(
    () => createIllustrationClient({ getToken }),
    [getToken],
  );

  const widgetLanguage = language === 'en-US' ? 'en' : 'es';
  const i18n = WIDGET_TRANSLATIONS[widgetLanguage];

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const appendTurn = useCallback((role: 'agent' | 'user', text: string) => {
    if (!text.trim()) return;
    recentTurnsRef.current = appendRecentStoryTurn(recentTurnsRef.current, role, text);
    conversationEndGuardRef.current.noteActivity();
    setHasStoryContent(true);
  }, []);

  const setWaitingForDrawingResponse = useCallback((waiting: boolean) => {
    isWaitingForDrawingResponseRef.current = waiting;
    setIsWaitingForDrawingResponse(waiting);
  }, []);

  const requestIllustration = useCallback(async (idempotencyKey: string) => {
    if (isGeneratingImageRef.current || recentTurnsRef.current.length === 0) return;

    isGeneratingImageRef.current = true;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setImageError(null);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const imageUrl = await illustrationClient.generate(
        analyzeStory(recentTurnsRef.current),
        idempotencyKey,
        controller.signal,
      );
      setGeneratedImage(imageUrl);
    } catch (error) {
      if (!controller.signal.aborted) {
        setImageError(
          error instanceof Error ? error.message : 'Failed to generate illustration',
        );
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        isGeneratingImageRef.current = false;
        setIsGeneratingImage(false);
      }
    }
  }, [illustrationClient]);

  const handleWidgetReady = useCallback((widget: HTMLElement) => {
    const handleConversationStart = () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      isGeneratingImageRef.current = false;
      sessionIdRef.current = createSessionId();
      recentTurnsRef.current = [];
      agentTurnRef.current = 0;
      manualTurnRef.current = 0;
      conversationEndGuardRef.current.noteActivity();
      setGeneratedImage(null);
      setImageError(null);
      setIsGeneratingImage(false);
      setHasStoryContent(false);
      setWaitingForDrawingResponse(false);
    };

    const handleConversationEnd = () => {
      conversationEndGuardRef.current.end(() => {
        setWaitingForDrawingResponse(false);
      });
    };

    const handleAgentResponse = (event: Event) => {
      const detail = (event as CustomEvent<WidgetResponseDetail>).detail;
      const response = detail?.text ?? '';
      if (!response.trim()) return;

      agentTurnRef.current += 1;
      appendTurn('agent', response);
      setWaitingForDrawingResponse(isIllustrationOffer(response));
    };

    const handleUserResponse = (event: Event) => {
      const detail = (event as CustomEvent<WidgetResponseDetail>).detail;
      const userText = detail?.text ?? '';
      if (!userText.trim()) return;

      appendTurn('user', userText);
      const acceptsOffer =
        isWaitingForDrawingResponseRef.current
        && isPositiveIllustrationResponse(userText);
      if (!acceptsOffer && !isExplicitIllustrationRequest(userText)) return;

      setWaitingForDrawingResponse(false);
      const turnIdentity =
        detail.messageId
        ?? detail.id
        ?? `${agentTurnRef.current}:${userText.trim().toLowerCase()}`;
      void requestIllustration(
        createStoryTurnIdempotencyKey(sessionIdRef.current, turnIdentity),
      );
    };

    widget.addEventListener('conversation-start', handleConversationStart);
    widget.addEventListener('conversation-end', handleConversationEnd);
    widget.addEventListener('agent-response', handleAgentResponse);
    widget.addEventListener('user-response', handleUserResponse);

    return () => {
      widget.removeEventListener('conversation-start', handleConversationStart);
      widget.removeEventListener('conversation-end', handleConversationEnd);
      widget.removeEventListener('agent-response', handleAgentResponse);
      widget.removeEventListener('user-response', handleUserResponse);
    };
  }, [
    appendTurn,
    requestIllustration,
    setWaitingForDrawingResponse,
  ]);

  const handleManualIllustration = () => {
    manualTurnRef.current += 1;
    void requestIllustration(
      createStoryTurnIdempotencyKey(
        sessionIdRef.current,
        `manual:${manualTurnRef.current}`,
      ),
    );
  };

  return (
    <div className="min-h-screen relative">
      <motion.div
        className="space-y-8 p-6 pb-16"
        style={{ paddingBottom: '70px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`${APP_ROUTES.servicesExtraCurricular}?tab=online`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <TranslatedText>Back to Online Learning</TranslatedText>
          </Button>

          <h1 className="text-xl font-semibold text-foreground">
            <TranslatedText>Storytelling Adventure</TranslatedText>
          </h1>

          <AiAccuracyNotice />
        </div>

        {hasStoryContent && (
          <div className="flex justify-center">
            <Button
              onClick={handleManualIllustration}
              size="md"
              disabled={isGeneratingImage}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ImageIcon className="h-5 w-5" />
              {isGeneratingImage
                ? <TranslatedText>Generating...</TranslatedText>
                : <TranslatedText>Draw your story</TranslatedText>}
            </Button>
          </div>
        )}

        <ElevenLabsWidget
          agentId={AGENT_IDS.storytelling}
          language={widgetLanguage}
          labels={i18n}
          onWidgetReady={handleWidgetReady}
          className="widget-container max-h-[calc(100vh-200px)] overflow-hidden"
        />

        {isWaitingForDrawingResponse && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-success/10 border border-success/20 rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-success">
              <div className="animate-pulse">
                <ImageIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">
                <TranslatedText>The storyteller is asking about creating a drawing...</TranslatedText>
              </span>
            </div>
            <p className="text-sm text-success mt-1">
              <TranslatedText>Say "yes" if you'd like me to create an illustration!</TranslatedText>
            </p>
          </motion.div>
        )}

        {(generatedImage || isGeneratingImage || imageError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {generatedImage ? (
              <div className="w-full space-y-4">
                <div className="relative w-full">
                  <img
                    src={generatedImage}
                    alt={storyIllustrationAlt}
                    decoding="async"
                    className="w-full h-auto rounded-lg shadow-lg"
                    onError={() => {
                      setGeneratedImage(null);
                      setImageError('Failed to load image');
                    }}
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = 'story-illustration.png';
                      link.click();
                    }}
                    className="absolute top-4 right-4 bg-background/80 hover:bg-background rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                    title={downloadIllustrationTitle}
                  >
                    <Download className="h-5 w-5 text-foreground" />
                  </button>
                </div>
              </div>
            ) : imageError ? (
              <div className="text-center py-8">
                <div role="alert" className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive">
                    <TranslatedText>Sorry, we couldn't create the illustration. Please try again.</TranslatedText>
                  </p>
                  <p className="text-destructive text-sm mt-2">Error: {imageError}</p>
                  <button
                    onClick={() => setImageError(null)}
                    className="mt-3 px-4 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-opacity"
                  >
                    <TranslatedText>Dismiss</TranslatedText>
                  </button>
                </div>
              </div>
            ) : (
              <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-8">
                <PaintingSpinner size="lg" />
                <div className="mt-4 text-center">
                  <p className="text-muted-foreground">
                    <TranslatedText>Creating your story illustration...</TranslatedText>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <TranslatedText>This may take a few moments</TranslatedText>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default StorytellingSession;
