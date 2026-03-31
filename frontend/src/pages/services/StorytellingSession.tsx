import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Download, Info } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import Button from '../../components/ui/Button';
import PaintingSpinner from '../../components/ui/PaintingSpinner';
import TranslatedText from '../../components/TranslatedText';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import { AGENT_IDS, WIDGET_TRANSLATIONS, WIDGET_CONFIG } from '../../config/agentConfig';

// Add window type for ElevenLabs API
declare global {
  interface Window {
    ElevenLabs?: {
      init?: (config: Record<string, unknown>) => void;
    };
  }
}

const StorytellingSession: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isElevenLabsLoaded, setIsElevenLabsLoaded] = useState(false);
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
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null);
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Configuration for SSE - disable in production/serverless environments
  const SSE_ENABLED = process.env.NODE_ENV === 'development' && !window.location.hostname.includes('vercel.app') && !window.location.hostname.includes('netlify.app');

  console.log('🔧 SSE Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    hostname: window.location.hostname,
    SSE_ENABLED
  });

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
    console.log('🧹 Clearing story state on component mount');
    setStoryContent('');
    setIsGeneratingImage(false);
    setGeneratedImage(null);
    setImageError(null);
  }, []); // Empty dependency array = run once on mount

  // Track image state changes
  useEffect(() => {
    console.log('🖼️ Image state changed:', {
      hasImage: !!generatedImage,
      imageUrl: generatedImage,
      isGenerating: isGeneratingImage,
      error: imageError
    });
  }, [generatedImage, isGeneratingImage, imageError]);

  // Track generatedImage specifically for debugging
  useEffect(() => {
    if (generatedImage) {
      console.log('🎯 Generated image set successfully:', generatedImage);
      console.log('🔗 Full image URL:', generatedImage);
    }
  }, [generatedImage]);

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = WIDGET_TRANSLATIONS[widgetLanguage as keyof typeof WIDGET_TRANSLATIONS];

  // Function to analyze story content and extract context
  const analyzeStoryContent = (text: string) => {
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
  };

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
    console.log('🎨 Starting image generation...', { customPrompt, storyContentParam, storyContent: storyContentRef.current });
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const token = await getToken();
      console.log('🔑 Token obtained:', !!token);

      // Use the provided story content or fall back to the ref
      const contentForAnalysis = storyContentParam || storyContentRef.current;
      console.log('📖 Current story content for analysis:', contentForAnalysis);

      let contextualPrompt: string;

      if (customPrompt) {
        contextualPrompt = customPrompt;
        console.log('📝 Using custom prompt:', contextualPrompt);
      } else {
        // Analyze the story content to extract context
        const analyzedContext = analyzeStoryContent(contentForAnalysis);
        console.log('🔍 Analyzed story context:', analyzedContext);

        // Generate contextual prompt based on the analyzed content
        contextualPrompt = generateContextualPrompt(analyzedContext);
        console.log('📝 Generated contextual prompt:', contextualPrompt);
      }

      console.log('🌐 Making API call to /api/images/generate...');
      console.log('🔗 API URL:', '/api/images/generate');
      console.log('🔑 Has Token:', !!token);
      console.log('📝 Prompt length:', contextualPrompt.length);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/images/generate-for-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: contextualPrompt }),
      });

      console.log('📡 API Response status:', response.status, response.statusText);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Success response:', data);
      console.log('🔍 Full response structure:', JSON.stringify(data, null, 2));

      // Handle multiple possible response formats:
      // 1. Direct API response: { imageUrl: "..." }
      // 2. SSE-style response: { data: { imageUrl: "..." } }
      // 3. Full SSE event: { type: "story-illustration", data: { imageUrl: "..." } }
      let imageUrl = null;

      if (data.type === 'story-illustration' && data.data?.imageUrl) {
        // Full SSE event format
        imageUrl = data.data.imageUrl;
        console.log('🎯 Found image URL in SSE event format');
      } else if (data.data?.imageUrl) {
        // SSE-style response format
        imageUrl = data.data.imageUrl;
        console.log('🎯 Found image URL in SSE-style format');
      } else if (data.imageUrl) {
        // Direct API response format (camelCase)
        imageUrl = data.imageUrl;
        console.log('🎯 Found image URL in direct API format (camelCase)');
      } else if (data.image_url) {
        // Direct API response format (snake_case)
        imageUrl = data.image_url;
        console.log('🎯 Found image URL in direct API format (snake_case)');
      }

      console.log('🖼️ Final image URL:', imageUrl);

      if (!imageUrl) {
        console.error('❌ No image URL found in response structure');
        console.error('🔍 Available keys in response:', Object.keys(data));
        throw new Error('No image URL received from the API');
      }

      setGeneratedImage(imageUrl);
      setStoryImages(prev => [...prev, imageUrl]);
      console.log('🎯 Image state updated successfully');
    } catch (error) {
      console.error('💥 Image generation error:', error);
      setImageError(error instanceof Error ? error.message : 'Failed to generate illustration');
    } finally {
      setIsGeneratingImage(false);
      console.log('🏁 Image generation process completed');
    }
  }, [getToken, generateContextualPrompt]);

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
      console.log('🚫 SSE disabled for serverless/production environment');
      setSseStatus('error'); // Set to error so UI shows fallback message
      return;
    }

    console.log('🔗 Setting up SSE connection to /api/events/story-illustrations');

    let eventSource: EventSource | null = null;
    let statusTimeout: NodeJS.Timeout;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/events/story-illustrations');
        setSseConnection(eventSource);

        eventSource.onopen = () => {
          console.log('✅ SSE connection opened successfully');
          setSseStatus('connected');
          reconnectAttempts = 0; // Reset on successful connection
        };

        // Force connection status after a short delay if onopen doesn't fire
        statusTimeout = setTimeout(() => {
          console.log('⏰ Force setting SSE status to connected after 2s timeout');
          setSseStatus('connected');
        }, 2000);

        eventSource.onmessage = (event) => {
          console.log('📨 SSE message received:', event.data);
          try {
            const data = JSON.parse(event.data);
            console.log('📊 Parsed SSE data:', data);

            if (data.type === 'generation-started') {
              console.log('🚀 Generation started event received');
              setIsGeneratingImage(true);
              setImageError(null);
              setSseStatus('connected');
            } else if (data.type === 'story-illustration') {
              console.log('🖼️ Story illustration event received:', data.data);
              console.log('🔗 Image URL from SSE:', data.data.imageUrl);

              // Set the generated image and stop loading
              setGeneratedImage(data.data.imageUrl);
              setStoryImages(prev => [...prev, data.data.imageUrl]);
              setIsGeneratingImage(false);
              setSseStatus('connected');

              console.log('✅ Image state updated from SSE');

              // Update story context from webhook data
              if (data.data.context) {
                const context = data.data.context;
                console.log('📝 Updating story context from SSE:', context);
                setStoryContext({
                  characters: context.characters ? [context.characters] : [],
                  setting: context.setting || 'a magical storybook world',
                  currentScene: context.current_scene || 'an enchanting scene',
                  mood: context.mood || 'cheerful'
                });
              }
            } else if (data.type === 'connected') {
              console.log('🔌 SSE connected event received');
              setSseStatus('connected');
            } else {
              console.log('❓ Unknown SSE event type:', data.type);
            }
          } catch (error) {
            console.error('❌ Error parsing SSE data:', error, 'Raw data:', event.data);
          }
        };

        eventSource.onerror = (error) => {
          console.error('💥 SSE connection error:', error);

          // Check if this is a MIME type error
          if (error && error.target && (error.target as EventSource).readyState === EventSource.CLOSED) {
            console.error('🚨 SSE connection closed - likely MIME type error (text/html instead of text/event-stream)');
            console.log('🔍 This usually means the endpoint is not properly configured or is returning an error page');
          }

          setSseStatus('error');

          // Only try to reconnect if we haven't exceeded max attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`🔄 Attempting SSE reconnection ${reconnectAttempts}/${maxReconnectAttempts}...`);

            // Clean up current connection
            if (eventSource) {
              eventSource.close();
              setSseConnection(null);
            }

            // Attempt reconnection after delay
            reconnectTimeout = setTimeout(() => {
              connectSSE();
            }, 2000 * reconnectAttempts); // Exponential backoff
          } else {
            console.error('❌ Max SSE reconnection attempts reached');
            console.log('💡 SSE connection failed - falling back to direct API calls only');
          }
        };

      } catch (error) {
        console.error('❌ Failed to create SSE connection:', error);
        setSseStatus('error');
      }
    };

    // Initial connection
    connectSSE();

    return () => {
      console.log('🔚 Cleaning up SSE connection');
      clearTimeout(statusTimeout);
      clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
        setSseConnection(null);
      }
    };
  }, [SSE_ENABLED]);

  // Load widget script
  useEffect(() => {
    if (!document.querySelector(`script[src="${WIDGET_CONFIG.SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = WIDGET_CONFIG.SCRIPT_SRC;
      script.async = true;

      script.onload = () => {
        console.log('✅ ElevenLabs script loaded successfully');
        const checkInterval = setInterval(() => {
          if (customElements.get(WIDGET_CONFIG.ELEMENT_NAME)) {
            clearInterval(checkInterval);
            console.log('✅ ElevenLabs widget element registered');
            setIsElevenLabsLoaded(true);
          }
        }, 100);
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load ElevenLabs script:', error);
        console.error('Script src:', WIDGET_CONFIG.SCRIPT_SRC);
      };

      document.head.appendChild(script);
    } else {
      console.log('✅ ElevenLabs script already loaded');
      setIsElevenLabsLoaded(true);
    }

    return () => {
      const widget = document.querySelector(WIDGET_CONFIG.ELEMENT_NAME);
      if (widget) widget.remove();
    };
  }, []);

  // Handle language changes and widget updates
  useEffect(() => {
    if (!isElevenLabsLoaded) return;

    // Remove existing widget
    const existingWidget = document.querySelector(WIDGET_CONFIG.ELEMENT_NAME);
    if (existingWidget) {
      existingWidget.remove();
    }

    // Initialize ElevenLabs with language config first
    const elevenLabs = window.ElevenLabs;
    if (typeof elevenLabs?.init === 'function') {
      elevenLabs.init({
        language: widgetLanguage,
        defaultLanguage: widgetLanguage
      });
    }

    // Wait a brief moment before creating the new widget
    setTimeout(() => {
      const container = document.querySelector('.widget-container');
      if (!container) {
        return;
      }

      // Create new widget with language configuration
      const widget = document.createElement(WIDGET_CONFIG.ELEMENT_NAME);

      // Configure widget
      const config = {
        'agent-id': AGENT_IDS.storytelling,
        'language': widgetLanguage,
        'default-language': widgetLanguage,
        'action-text': i18n.actionText,
        'start-call-text': i18n.startCall,
        'end-call-text': i18n.endCall,
        'expand-text': i18n.expand,
        'listening-text': i18n.listening,
        'speaking-text': i18n.speaking,
        'style': 'display: block; margin: 0 auto;'
      };

      // Apply all attributes
      Object.entries(config).forEach(([key, value]) => {
        widget.setAttribute(key, value);
      });

      // Add event listeners for conversation events
      widget.addEventListener('conversation-start', () => {
        console.log('🎬 Conversation started');
      });

      widget.addEventListener('conversation-end', () => {
        console.log('🎬 Conversation ended, story length:', currentStoryContentRef.current.length);
        // Analyze the complete story and generate a final illustration
        if (currentStoryContentRef.current.length > 50) {
          const finalContext = analyzeStoryContent(currentStoryContentRef.current);
          console.log('📖 Final story context:', finalContext);
          setStoryContext(finalContext);

          // Auto-generate final illustration
          setTimeout(() => {
            console.log('🎨 Auto-generating final illustration after conversation end');
            handleGenerateIllustrationRef.current(undefined, currentStoryContentRef.current);
          }, 1000);
        }
      });

      widget.addEventListener('agent-response', (event: Event) => {
        const customEvent = event as CustomEvent;
        const response = customEvent.detail?.text || '';
        console.log('🤖 Agent response received:', response.substring(0, 100) + '...');

        // Accumulate story content
        const newStoryContent = currentStoryContentRef.current + ' ' + response;
        currentStoryContentRef.current = newStoryContent; // Update local variable immediately
        setStoryContent(newStoryContent);

        // Continuously analyze story context
        if (newStoryContent.length > 100) {
          const newContext = analyzeStoryContent(newStoryContent);
          console.log('📊 Updated story context:', newContext);
          setStoryContext(newContext);
        }

        // Check if agent mentions creating an illustration
        const lowerResponse = response.toLowerCase();
        const illustrationKeywords = [
          'illustration', 'picture', 'drawing', 'image', 'created', 'beautiful illustration',
          'i\'ve created', 'here\'s an illustration', 'let me create', 'generated an image',
          'ilustración', 'imagen', 'dibujo', 'he creado', 'hermosa ilustración'
        ];

        const mentionsIllustration = illustrationKeywords.some(keyword =>
          lowerResponse.includes(keyword)
        );

        if (mentionsIllustration && !isGeneratingImageRef.current) {
          console.log('🎨 Agent mentioned creating illustration, triggering DIRECT API call');
          console.log('🤖 Agent response that triggered illustration:', response);
          console.log('📖 Current story content for illustration:', newStoryContent);

          // Trigger direct API call after a short delay with the current story content
          setTimeout(() => {
            console.log('🚀 Executing delayed illustration generation...');
            handleGenerateIllustrationRef.current(undefined, newStoryContent);
          }, 1000);
        }
      });

      widget.addEventListener('user-response', (event: Event) => {
        const customEvent = event as CustomEvent;
        const userText = customEvent.detail?.text || '';
        console.log('👤 User response received:', userText.substring(0, 100) + '...');

        // Accumulate story content from user as well
        const newStoryContent = currentStoryContentRef.current + ' ' + userText;
        currentStoryContentRef.current = newStoryContent; // Update local variable immediately
        setStoryContent(newStoryContent);

        const lowerUserText = userText.toLowerCase();

        // Priority 1: Check if agent asked about drawing and user said yes
        if (isWaitingForDrawingResponseRef.current) {
          console.log('⏳ Waiting for drawing response, analyzing user text:', lowerUserText);

          const positiveResponses = [
            // English
            'yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'please',
            'sounds good', 'that would be great', 'i would like that',
            'absolutely', 'definitely', 'of course', 'go ahead',

            // Spanish (Español)
            'sí', 'claro', 'por favor', 'vale', 'perfecto', 'genial',
            'me gustaría', 'por supuesto', 'adelante', 'bueno',

            // Chinese (中文)
            '是', '好', '可以', '当然', '行', '没问题', '太好了',
            '我想要', '请', '好的', '是的', '好啊',

            // Ukrainian (Українська)
            'так', 'добре', 'звичайно', 'будь ласка', 'чудово',
            'я б хотів', 'я б хотіла', 'гаразд', 'окей', 'авжеж',

            // Romanian (Română)
            'da', 'bine', 'desigur', 'vă rog', 'perfect', 'minunat',
            'mi-ar plăcea', 'în regulă', 'evident', 'hai'
          ];

          const negativeResponses = [
            // English
            'no', 'nah', 'not now', 'maybe later', 'not really',
            'no thanks', 'no thank you', 'not interested', 'pass',

            // Spanish (Español)
            'no', 'no gracias', 'ahora no', 'quizás después', 'mejor no',
            'no me interesa', 'paso', 'tal vez luego',

            // Chinese (中文)
            '不', '不要', '不用', '算了', '不需要', '暂时不用',
            '不感兴趣', '以后吧', '不了',

            // Ukrainian (Українська)
            'ні', 'не треба', 'не зараз', 'можливо пізніше', 'краще ні',
            'дякую, ні', 'не цікавить', 'поки що ні',

            // Romanian (Română)
            'nu', 'nu mulțumesc', 'nu acum', 'poate mai târziu', 'nu vreau',
            'nu sunt interesant', 'trec', 'nu e cazul'
          ];

          if (positiveResponses.some(response => lowerUserText.includes(response))) {
            console.log('✅ User said YES to drawing request, triggering DIRECT illustration API call');
            setIsWaitingForDrawingResponse(false);
            // Force direct API call instead of relying on webhook
            setTimeout(() => handleGenerateIllustrationRef.current(undefined, newStoryContent), 500);
            return; // Don't process other patterns
          } else if (negativeResponses.some(response => lowerUserText.includes(response))) {
            console.log('❌ User said NO to drawing request');
            setIsWaitingForDrawingResponse(false);
            return;
          }
        }

        // Priority 2: Check if user explicitly wants an illustration (original logic)
        if ((lowerUserText.includes('yes') || lowerUserText.includes('please')) &&
          (lowerUserText.includes('illustration') ||
            lowerUserText.includes('picture') ||
            lowerUserText.includes('draw') ||
            lowerUserText.includes('show me'))) {
          console.log('🎯 User explicitly requested illustration (yes/please + keyword)');
          handleGenerateIllustrationRef.current(undefined, newStoryContent);
          return;
        }

        // Priority 3: Direct drawing requests
        const drawingRequests = [
          // English
          'draw', 'picture', 'illustration', 'show me', 'paint', 'sketch',
          'can you draw', 'make a picture', 'create an image', 'visualize',

          // Spanish (Español)
          'dibuja', 'dibujar', 'imagen', 'ilustración', 'muéstrame', 'pintar',
          'puedes dibujar', 'hacer una imagen', 'crear una imagen', 'visualizar',

          // Chinese (中文)
          '画', '绘画', '图片', '插图', '给我看', '画画', '能画吗',
          '做个图', '创建图像', '可视化', '描绘',

          // Ukrainian (Українська)
          'малюй', 'малювати', 'картинка', 'ілюстрація', 'покажи мені', 'намалюй',
          'чи можеш намалювати', 'зроби картинку', 'створи зображення', 'візуалізуй',

          // Romanian (Română)
          'desenează', 'a desena', 'imagine', 'ilustrație', 'arată-mi', 'pictează',
          'poți desena', 'fă o imagine', 'creează o imagine', 'vizualizează'
        ];

        const matchedRequest = drawingRequests.find(request => lowerUserText.includes(request));
        if (matchedRequest) {
          console.log('🎨 Direct drawing request detected, calling DIRECT API:', matchedRequest);
          // Force direct API call instead of relying on webhook
          setTimeout(() => handleGenerateIllustrationRef.current(undefined, newStoryContent), 500);
        }
      });

      // Add to DOM
      container.appendChild(widget);
    }, 100);

  }, [isElevenLabsLoaded, widgetLanguage, i18n]);

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
        {/* Header with Back Button and AI Notice */}
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

          {/* AI Notice Icon with Tooltip */}
          <div className="relative group">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Info className="h-5 w-5" />
            </button>

            {/* Modern Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg">
              <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
              <TranslatedText>AI-generated content may contain inaccuracies. Use at your own discretion.</TranslatedText>
            </div>
          </div>
        </div>

        {/* Draw Your Story Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => handleGenerateIllustration(undefined, currentStoryContentRef.current)}
            size="md"
            disabled={isGeneratingImage}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <ImageIcon className="h-5 w-5" />
            {isGeneratingImage ? <TranslatedText>Generating...</TranslatedText> : <TranslatedText>Draw your story</TranslatedText>}
          </Button>
        </div>



        {/* Widget Container */}
        <div
          className="widget-container"
          style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'hidden' }}
        />

        {/* Drawing Request Indicator */}
        {isWaitingForDrawingResponse && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-green-700">
              <div className="animate-pulse">
                <ImageIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">
                <TranslatedText>The storyteller is asking about creating a drawing...</TranslatedText>
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              <TranslatedText>Say "yes" if you'd like me to create an illustration!</TranslatedText>
            </p>
            <p className="text-xs text-green-500 mt-1 opacity-75">
              English: "yes" | Español: "sí" | 中文: "好" | Українська: "так" | Română: "da"
            </p>
          </motion.div>
        )}

        {/* Story Illustration - Full Screen Display */}
        {(() => {
          const shouldShowSection = !!(generatedImage || isGeneratingImage || imageError);
          const debugInfo = {
            shouldShowSection,
            generatedImage: !!generatedImage,
            isGeneratingImage,
            imageError: !!imageError,
            sseStatus,
            sseConnection: !!sseConnection,
            imageUrl: generatedImage ? 'present' : 'null',
            actualImageUrl: generatedImage
          };

          console.log('🔍 Image section render check:', debugInfo);

          if (!shouldShowSection) {
            console.log('❌ Not showing image section - conditions not met:', debugInfo);
            return null;
          }

          console.log('✅ Showing image section with conditions:', debugInfo);

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                  <strong>Debug:</strong> Image: {generatedImage ? '✅' : '❌'} |
                  Loading: {isGeneratingImage ? '✅' : '❌'} |
                  Error: {imageError ? '✅' : '❌'} |
                  URL: {generatedImage ? generatedImage.substring(0, 50) + '...' : 'none'}
                </div>
              )}

              {(() => {
                // Priority 1: Show the image if we have one (regardless of loading state)
                if (generatedImage) {
                  console.log('🖼️ Rendering image:', generatedImage);
                  return (
                    <div className="w-full space-y-4">
                      {/* Full-width image without frame */}
                      <div className="relative w-full">
                        <img
                          src={generatedImage}
                          alt="Story illustration"
                          className="w-full h-auto rounded-lg shadow-lg"
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', generatedImage);
                          }}
                          onError={(e) => {
                            console.log('❌ Image failed to load:', generatedImage);
                            console.error('Image error details:', e);
                            setImageError('Failed to load image');
                            setIsGeneratingImage(false);
                          }}
                        />

                        {/* Minimal download button - just icon */}
                        <button
                          onClick={() => {
                            console.log('💾 Downloading image:', generatedImage);
                            const link = document.createElement('a');
                            link.href = generatedImage;
                            link.download = 'story-illustration.png';
                            link.click();
                          }}
                          className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                          title="Download Illustration"
                        >
                          <Download className="h-5 w-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  );
                }

                // Priority 2: Show error if there's an error
                if (imageError) {
                  console.log('❌ Showing error message:', imageError);
                  return (
                    <div className="text-center py-8">
                      <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">
                          <TranslatedText>Sorry, we couldn't create the illustration. Please try again.</TranslatedText>
                        </p>
                        <p className="text-red-600 text-sm mt-2">Error: {imageError}</p>
                        <button
                          onClick={() => {
                            setImageError(null);
                            setIsGeneratingImage(false);
                          }}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <TranslatedText>Dismiss</TranslatedText>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Priority 3: Show loading indicator only if we don't have an image yet
                if (isGeneratingImage) {
                  console.log('⏳ Showing loading spinner');
                  return (
                    <div className="flex flex-col items-center justify-center py-8">
                      <PaintingSpinner size="lg" />
                      <div className="mt-4 text-center">
                        <p className="text-gray-600">
                          <TranslatedText>Creating your story illustration...</TranslatedText>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          <TranslatedText>This may take a few moments</TranslatedText>
                        </p>
                      </div>
                    </div>
                  );
                }

                console.log('❓ No condition met in image rendering logic');
                return null;
              })()}
            </motion.div>
          );
        })()}
      </motion.div>


    </div>
  );
};

export default StorytellingSession;
