import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Download } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import Button from '../../components/ui/Button';
import PaintingSpinner from '../../components/ui/PaintingSpinner';
import TranslatedText from '../../components/TranslatedText';
import useTranslatedString from '../../hooks/useTranslatedString';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import ElevenLabsWidget from '../../components/ElevenLabsWidget';
import AiAccuracyNotice from '../../components/AiAccuracyNotice';

const ILLUSTRATION_KEYWORDS = [
  'illustration', 'picture', 'drawing', 'image', 'created', 'beautiful illustration',
  'i\'ve created', 'here\'s an illustration', 'let me create', 'generated an image',
  'ilustración', 'imagen', 'dibujo', 'he creado', 'hermosa ilustración',
];

const POSITIVE_DRAWING_RESPONSES = [
  'yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'please', 'sounds good',
  'that would be great', 'i would like that', 'absolutely', 'definitely',
  'of course', 'go ahead', 'sí', 'claro', 'por favor', 'vale', 'perfecto',
  'genial', 'me gustaría', 'por supuesto', 'adelante', 'bueno', '是', '好',
  '可以', '当然', '行', '没问题', '太好了', '我想要', '请', '好的', '是的',
  '好啊', 'так', 'добре', 'звичайно', 'будь ласка', 'чудово', 'я б хотів',
  'я б хотіла', 'гаразд', 'окей', 'авжеж', 'da', 'bine', 'desigur',
  'vă rog', 'perfect', 'minunat', 'mi-ar plăcea', 'în regulă', 'evident', 'hai',
];

const NEGATIVE_DRAWING_RESPONSES = [
  'no', 'nah', 'not now', 'maybe later', 'not really', 'no thanks',
  'no thank you', 'not interested', 'pass', 'no gracias', 'ahora no',
  'quizás después', 'mejor no', 'no me interesa', 'paso', 'tal vez luego',
  '不', '不要', '不用', '算了', '不需要', '暂时不用', '不感兴趣', '以后吧',
  '不了', 'ні', 'не треба', 'не зараз', 'можливо пізніше', 'краще ні',
  'дякую, ні', 'не цікавить', 'поки що ні', 'nu', 'nu mulțumesc',
  'nu acum', 'poate mai târziu', 'nu vreau', 'nu sunt interesant',
  'trec', 'nu e cazul',
];

const DRAWING_REQUESTS = [
  'draw', 'picture', 'illustration', 'show me', 'paint', 'sketch',
  'can you draw', 'make a picture', 'create an image', 'visualize',
  'dibuja', 'dibujar', 'imagen', 'ilustración', 'muéstrame', 'pintar',
  'puedes dibujar', 'hacer una imagen', 'crear una imagen', 'visualizar',
  '画', '绘画', '图片', '插图', '给我看', '画画', '能画吗', '做个图',
  '创建图像', '可视化', '描绘', 'малюй', 'малювати', 'картинка',
  'ілюстрація', 'покажи мені', 'намалюй', 'чи можеш намалювати',
  'зроби картинку', 'створи зображення', 'візуалізуй', 'desenează',
  'a desena', 'imagine', 'ilustrație', 'arată-mi', 'pictează',
  'poți desena', 'fă o imagine', 'creează o imagine', 'vizualizează',
];

const StorytellingSession: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const storyIllustrationAlt = useTranslatedString("Story illustration");
  const downloadIllustrationTitle = useTranslatedString("Download Illustration");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [storyImages, setStoryImages] = useState<string[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [storyContent, setStoryContent] = useState<string>('');

  // Define the story context type
  type StoryContext = {
    characters: string[];
    setting: string;
    currentScene: string;
    mood: string;
  };

  const [storyContext, setStoryContext] = useState<StoryContext>({ // eslint-disable-line @typescript-eslint/no-unused-vars
    characters: [],
    setting: '',
    currentScene: '',
    mood: 'cheerful'
  });
  const [isWaitingForDrawingResponse, setIsWaitingForDrawingResponse] = useState(false);
  const { language } = useLingoTranslation();
  // Configuration for SSE - disable in production/serverless environments
  const SSE_ENABLED = import.meta.env.DEV
    && !window.location.hostname.includes('vercel.app')
    && !window.location.hostname.includes('netlify.app');

  // Refs for accessing current values in event listeners
  const storyContentRef = useRef(storyContent);
  const isWaitingForDrawingResponseRef = useRef(isWaitingForDrawingResponse);
  const isGeneratingImageRef = useRef(isGeneratingImage);

  // Ref to track current story content in real-time across renders
  const currentStoryContentRef = useRef('');

  // Update refs when values change
  useEffect(() => {
    storyContentRef.current = storyContent;
    currentStoryContentRef.current = storyContent;
  }, [storyContent]);

  useEffect(() => {
    isWaitingForDrawingResponseRef.current = isWaitingForDrawingResponse;
  }, [isWaitingForDrawingResponse]);

  useEffect(() => {
    isGeneratingImageRef.current = isGeneratingImage;
  }, [isGeneratingImage]);

  // Clear story content on mount to ensure fresh start
  useEffect(() => {
    setStoryContent('');
    setIsGeneratingImage(false);
    setGeneratedImage(null);
    setImageError(null);
  }, []); // Empty dependency array = run once on mount

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = WIDGET_TRANSLATIONS[widgetLanguage as keyof typeof WIDGET_TRANSLATIONS];

  // Function to analyze story content and extract context
  const analyzeStoryContent = useCallback((text: string) => {
    const lowerText = text.toLowerCase();

    // Extract characters (look for names and common character types)
    const characterPatterns = [
      /(?:princess|prince|king|queen|knight|dragon|fairy|witch|wizard|bear|wolf|rabbit|fox|cat|dog|bird|mouse)\s+(\w+)/gi,
      /(?:a|the)\s+(princess|prince|king|queen|knight|dragon|fairy|witch|wizard|bear|wolf|rabbit|fox|cat|dog|bird|mouse)/gi,
      /(\w+)\s+(?:said|asked|replied|whispered|shouted|laughed|cried)/gi
    ];

    const characters = new Set<string>();
    characterPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/^(a|the|said|asked|replied|whispered|shouted|laughed|cried)\s*/gi, '').trim();
          if (cleaned.length > 2) characters.add(cleaned);
        });
      }
    });

    // Extract setting (look for location indicators)
    const settingPatterns = [
      /(?:in|at|near|by)\s+(?:a|the)\s+(castle|forest|village|mountain|river|lake|sea|cave|house|cottage|palace|garden|meadow|bridge)/gi,
      /(?:once upon a time)\s+(?:in|at)\s+(?:a|the)\s+(\w+)/gi
    ];

    let setting = '';
    settingPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match && !setting) {
        setting = match[0].replace(/^(in|at|near|by|once upon a time)\s*/gi, '').trim();
      }
    });

    // Determine mood based on keywords
    const moodKeywords = {
      happy: ['happy', 'joy', 'laugh', 'smile', 'cheerful', 'bright', 'sunny', 'celebration'],
      scary: ['dark', 'scary', 'frightened', 'monster', 'ghost', 'shadow', 'thunder'],
      sad: ['sad', 'cry', 'tear', 'lonely', 'lost', 'worried', 'afraid'],
      magical: ['magic', 'spell', 'enchanted', 'fairy', 'wizard', 'sparkle', 'transform'],
      adventurous: ['adventure', 'journey', 'explore', 'discover', 'quest', 'brave', 'hero']
    };

    let mood = 'cheerful';
    let maxCount = 0;
    Object.entries(moodKeywords).forEach(([moodType, keywords]) => {
      const count = keywords.reduce((acc, keyword) =>
        acc + (lowerText.split(keyword).length - 1), 0);
      if (count > maxCount) {
        maxCount = count;
        mood = moodType;
      }
    });

    // Extract current scene (last significant action or description)
    const scenePatterns = [
      /(?:suddenly|then|next|finally|meanwhile)\s+([^.!?]+)[.!?]/gi,
      /(?:they|he|she|it)\s+(walked|ran|flew|climbed|entered|discovered|found|saw)([^.!?]+)[.!?]/gi
    ];

    let currentScene = '';
    scenePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        currentScene = matches[matches.length - 1].replace(/^(suddenly|then|next|finally|meanwhile)\s*/gi, '').trim();
      }
    });

    return {
      characters: Array.from(characters).slice(0, 3), // Limit to 3 main characters
      setting: setting || 'a magical storybook world',
      currentScene: currentScene || 'the beginning of an adventure',
      mood
    };
  }, []);

  // Function to generate contextual illustration prompt
  const generateContextualPrompt = useCallback((context: StoryContext, customPrompt?: string) => {
    if (customPrompt) return customPrompt;

    const { characters, setting, currentScene, mood } = context;

    // Base style for children's illustrations
    const baseStyle = "Children's book illustration, cartoon style, vibrant colors, friendly and approachable";

    // Mood-based style modifiers
    const moodStyles = {
      happy: "bright and cheerful colors, sunny atmosphere, smiling characters",
      scary: "dramatic lighting, mysterious shadows, but still child-appropriate and not too frightening",
      sad: "soft, muted colors, gentle expressions, comforting atmosphere",
      magical: "sparkles, glowing effects, enchanted atmosphere, mystical elements",
      adventurous: "dynamic composition, action poses, exciting landscape, bold colors",
      cheerful: "warm colors, pleasant lighting, joyful expressions"
    };

    // Character description
    const characterDesc = characters.length > 0
      ? `featuring ${characters.slice(0, 2).join(' and ')}${characters.length > 2 ? ' and others' : ''}`
      : 'with charming storybook characters';

    // Scene description
    const sceneDesc = currentScene.length > 10
      ? `showing ${currentScene.substring(0, 100)}`
      : 'in an engaging story scene';

    // Combine all elements
    const prompt = `${baseStyle}, ${moodStyles[mood as keyof typeof moodStyles] || moodStyles.cheerful},
      set in ${setting}, ${characterDesc}, ${sceneDesc}.
      Perfect for children ages 4-10, safe and wholesome content, high quality digital art.`;

    return prompt.replace(/\s+/g, ' ').trim();
  }, []);

  // Function to generate illustration
  const handleGenerateIllustration = useCallback(async (customPrompt?: string, storyContentParam?: string) => {
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const token = await getToken();

      // Use the provided story content or fall back to the ref
      const contentForAnalysis = storyContentParam || storyContentRef.current;

      let contextualPrompt: string;

      if (customPrompt) {
        contextualPrompt = customPrompt;
      } else {
        // Analyze the story content to extract context
        const analyzedContext = analyzeStoryContent(contentForAnalysis);

        // Generate contextual prompt based on the analyzed content
        contextualPrompt = generateContextualPrompt(analyzedContext);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/images/generate-for-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: contextualPrompt }),
      });

      if (!response.ok) {
        throw new Error('Image generation request failed');
      }

      const data = await response.json();

      // Handle multiple possible response formats:
      // 1. Direct API response: { imageUrl: "..." }
      // 2. SSE-style response: { data: { imageUrl: "..." } }
      // 3. Full SSE event: { type: "story-illustration", data: { imageUrl: "..." } }
      let imageUrl = null;

      if (data.type === 'story-illustration' && data.data?.imageUrl) {
        // Full SSE event format
        imageUrl = data.data.imageUrl;
      } else if (data.data?.imageUrl) {
        // SSE-style response format
        imageUrl = data.data.imageUrl;
      } else if (data.imageUrl) {
        // Direct API response format (camelCase)
        imageUrl = data.imageUrl;
      } else if (data.image_url) {
        // Direct API response format (snake_case)
        imageUrl = data.image_url;
      }

      if (!imageUrl) {
        throw new Error('No image URL received from the API');
      }

      setGeneratedImage(imageUrl);
      setStoryImages(prev => [...prev, imageUrl]);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Failed to generate illustration');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [analyzeStoryContent, getToken, generateContextualPrompt]);

  // Ref for handleGenerateIllustration to use in event listeners
  const handleGenerateIllustrationRef = useRef(handleGenerateIllustration);

  // Update ref when function changes
  useEffect(() => {
    handleGenerateIllustrationRef.current = handleGenerateIllustration;
  }, [handleGenerateIllustration]);

  // Setup SSE connection for webhook-generated illustrations
  useEffect(() => {
    // Skip SSE setup if disabled
    if (!SSE_ENABLED) {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    let reconnectAttempts = 0;
    let cancelled = false;
    const maxReconnectAttempts = 3;

    const connectSSE = () => {
      if (cancelled) return;
      try {
        eventSource = new EventSource('/events/story-illustrations');

        eventSource.onopen = () => {
          reconnectAttempts = 0; // Reset on successful connection
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'generation-started') {
              setIsGeneratingImage(true);
              setImageError(null);
            } else if (data.type === 'story-illustration') {
              // Set the generated image and stop loading
              setGeneratedImage(data.data.imageUrl);
              setStoryImages(prev => [...prev, data.data.imageUrl]);
              setIsGeneratingImage(false);

              // Update story context from webhook data
              if (data.data.context) {
                const context = data.data.context;
                setStoryContext({
                  characters: context.characters ? [context.characters] : [],
                  setting: context.setting || 'a magical storybook world',
                  currentScene: context.current_scene || 'an enchanting scene',
                  mood: context.mood || 'cheerful'
                });
              }
            }
          } catch {
            // Ignore malformed events; the direct API path remains available.
          }
        };

        eventSource.onerror = () => {
          if (cancelled) return;
          // Only try to reconnect if we haven't exceeded max attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;

            // Clean up current connection
            if (eventSource) {
              eventSource.close();
            }

            // Attempt reconnection after delay
            reconnectTimeout = setTimeout(() => {
              connectSSE();
            }, 2000 * reconnectAttempts); // Exponential backoff
          }
        };

      } catch {
        // The direct API path remains available when SSE cannot connect.
      }
    };

    // Initial connection
    connectSSE();

    return () => {
      cancelled = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [SSE_ENABLED]);

  const handleWidgetReady = useCallback((widget: HTMLElement) => {
    const handleConversationEnd = () => {
      const content = currentStoryContentRef.current;
      if (content.length <= 50) return;

      setStoryContext(analyzeStoryContent(content));
      void handleGenerateIllustrationRef.current(undefined, content);
    };

    const handleAgentResponse = (event: Event) => {
      const response = (event as CustomEvent<{ text?: string }>).detail?.text ?? '';
      const content = `${currentStoryContentRef.current} ${response}`;
      currentStoryContentRef.current = content;
      setStoryContent(content);

      if (content.length > 100) {
        setStoryContext(analyzeStoryContent(content));
      }
      if (
        ILLUSTRATION_KEYWORDS.some(keyword => response.toLowerCase().includes(keyword))
        && !isGeneratingImageRef.current
      ) {
        void handleGenerateIllustrationRef.current(undefined, content);
      }
    };

    const handleUserResponse = (event: Event) => {
      const userText = (event as CustomEvent<{ text?: string }>).detail?.text ?? '';
      const content = `${currentStoryContentRef.current} ${userText}`;
      currentStoryContentRef.current = content;
      setStoryContent(content);

      const normalizedText = userText.toLowerCase();
      if (isWaitingForDrawingResponseRef.current) {
        if (POSITIVE_DRAWING_RESPONSES.some(response => normalizedText.includes(response))) {
          setIsWaitingForDrawingResponse(false);
          void handleGenerateIllustrationRef.current(undefined, content);
          return;
        }
        if (NEGATIVE_DRAWING_RESPONSES.some(response => normalizedText.includes(response))) {
          setIsWaitingForDrawingResponse(false);
          return;
        }
      }

      const confirmsIllustration =
        (normalizedText.includes('yes') || normalizedText.includes('please'))
        && ['illustration', 'picture', 'draw', 'show me']
          .some(keyword => normalizedText.includes(keyword));
      if (confirmsIllustration || DRAWING_REQUESTS.some(request => normalizedText.includes(request))) {
        void handleGenerateIllustrationRef.current(undefined, content);
      }
    };

    widget.addEventListener('conversation-end', handleConversationEnd);
    widget.addEventListener('agent-response', handleAgentResponse);
    widget.addEventListener('user-response', handleUserResponse);

    return () => {
      widget.removeEventListener('conversation-end', handleConversationEnd);
      widget.removeEventListener('agent-response', handleAgentResponse);
      widget.removeEventListener('user-response', handleUserResponse);
    };
  }, [analyzeStoryContent]);

  // Global timeout to clear loading state if image takes too long
  useEffect(() => {
    if (isGeneratingImage) {
      const timeout = setTimeout(() => {
        setIsGeneratingImage(false);
      }, 60000); // 60 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [isGeneratingImage]);



  return (
    <div className="min-h-screen relative">
      {/* Main Content */}
      <motion.div
        className="space-y-8 p-6 pb-16"
        style={{ paddingBottom: '70px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header with Back Button, Title, and AI Notice */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/services/extra-curricular?tab=online')}
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

        {/* Draw Your Story Button — only shown once story content exists */}
        {storyContent && (
          <div className="flex justify-center">
            <Button
              onClick={() => handleGenerateIllustration(undefined, currentStoryContentRef.current)}
              size="md"
              disabled={isGeneratingImage}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ImageIcon className="h-5 w-5" />
              {isGeneratingImage ? <TranslatedText>Generating...</TranslatedText> : <TranslatedText>Draw your story</TranslatedText>}
            </Button>
          </div>
        )}

        {/* Widget Container */}
        <ElevenLabsWidget
          agentId={AGENT_IDS.storytelling}
          language={widgetLanguage}
          labels={i18n}
          onWidgetReady={handleWidgetReady}
          className="widget-container max-h-[calc(100vh-200px)] overflow-hidden"
        />

        {/* Drawing Request Indicator */}
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
            <p className="text-xs text-success mt-1 opacity-75">
              English: "yes" | Español: "sí" | 中文: "好" | Українська: "так" | Română: "da"
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
                      setImageError('Failed to load image');
                      setIsGeneratingImage(false);
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
                    onClick={() => {
                      setImageError(null);
                      setIsGeneratingImage(false);
                    }}
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
