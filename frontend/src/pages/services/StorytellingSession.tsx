import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Download } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import { AGENT_IDS, WIDGET_TRANSLATIONS, WIDGET_CONFIG } from '../../config/agentConfig';

// Add window type for ElevenLabs API
declare global {
  interface Window {
    ElevenLabs?: {
      init?: (config: any) => void;
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
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [storyContent, setStoryContent] = useState<string>('');
  const [storyContext, setStoryContext] = useState({
    characters: [] as string[],
    setting: '',
    currentScene: '',
    mood: 'cheerful'
  });
  const [isWaitingForDrawingResponse, setIsWaitingForDrawingResponse] = useState(false);
  const { language } = useLingoTranslation();
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null);
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Clear story content on mount to ensure fresh start
  useEffect(() => {
    setStoryContent('');
    setIsGeneratingImage(false);
    setGeneratedImage(null);
    setImageError(null);
  }, []); // Empty dependency array = run once on mount

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = WIDGET_TRANSLATIONS[widgetLanguage];

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
  const generateContextualPrompt = (context: typeof storyContext, customPrompt?: string) => {
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
  };

  // Function to generate illustration
  const handleGenerateIllustration = async (customPrompt?: string) => {
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const token = await getToken();
      // Generate contextual prompt based on story analysis
      const contextualPrompt = generateContextualPrompt(storyContext, customPrompt);
      
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: contextualPrompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setStoryImages(prev => [...prev, data.imageUrl]);
    } catch (error) {
      console.error('Image generation error:', error);
      setImageError(error instanceof Error ? error.message : 'Failed to generate illustration');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Setup SSE connection for webhook-generated illustrations
  useEffect(() => {
    const eventSource = new EventSource('/events/story-illustrations');
    setSseConnection(eventSource);

    eventSource.onopen = () => {
      setSseStatus('connected');
    };

    // Force connection status after a short delay
    const statusTimeout = setTimeout(() => {
      setSseStatus('connected');
    }, 2000);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'generation-started') {
          setIsGeneratingImage(true);
          setImageError(null);
          setSseStatus('connected');
        } else if (data.type === 'story-illustration') {
          // Set the generated image and stop loading
          setGeneratedImage(data.data.imageUrl);
          setStoryImages(prev => [...prev, data.data.imageUrl]);
          setIsGeneratingImage(false);
          setSseStatus('connected');
          
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
        } else if (data.type === 'connected') {
          setSseStatus('connected');
        }
      } catch (error) {
        // Handle SSE parsing errors silently
      }
    };

    eventSource.onerror = (error) => {
      setSseStatus('error');
    };

    return () => {
      clearTimeout(statusTimeout);
      eventSource.close();
      setSseConnection(null);
    };
  }, []);

  // Load widget script
  useEffect(() => {
    if (!document.querySelector(`script[src="${WIDGET_CONFIG.SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = WIDGET_CONFIG.SCRIPT_SRC;
      script.async = true;
      
      script.onload = () => {
        const checkInterval = setInterval(() => {
          if (customElements.get(WIDGET_CONFIG.ELEMENT_NAME)) {
            clearInterval(checkInterval);
            setIsElevenLabsLoaded(true);
          }
        }, 100);
      };

      document.head.appendChild(script);
    } else {
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
      widget.addEventListener('conversation-start', (event: any) => {
        // Conversation started
      });
      
      widget.addEventListener('conversation-end', (event: any) => {
        // Analyze the complete story and generate a final illustration
        if (storyContent.length > 50) {
          const finalContext = analyzeStoryContent(storyContent);
          setStoryContext(finalContext);
          
          // Auto-generate final illustration
          setTimeout(() => {
            handleGenerateIllustration();
          }, 1000);
        }
      });

      widget.addEventListener('agent-response', (event: any) => {
        const response = event.detail?.text || '';
        
        // Accumulate story content
        setStoryContent(prev => prev + ' ' + response);
        
        // Continuously analyze story context
        const updatedContent = storyContent + ' ' + response;
        if (updatedContent.length > 100) {
          const newContext = analyzeStoryContent(updatedContent);
          setStoryContext(newContext);
        }
      });

      widget.addEventListener('user-response', (event: any) => {
        const userText = event.detail?.text || '';
        
        // Accumulate story content from user as well
        setStoryContent(prev => prev + ' ' + userText);
        
        const lowerUserText = userText.toLowerCase();
        
        // Priority 1: Check if agent asked about drawing and user said yes
        if (isWaitingForDrawingResponse) {
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
            setIsWaitingForDrawingResponse(false);
            handleGenerateIllustration();
            return; // Don't process other patterns
          } else if (negativeResponses.some(response => lowerUserText.includes(response))) {
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
          handleGenerateIllustration();
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
        
        if (drawingRequests.some(request => lowerUserText.includes(request))) {
          handleGenerateIllustration();
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
    <motion.div
      className="space-y-8 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/services/extra-curricular?tab=online')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Online Learning</TranslatedText>
        </Button>
      </div>

      {/* Widget Container */}
      <div className="widget-container" />

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
        
        if (!shouldShowSection) return null;
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {(() => {
              // Priority 1: Show the image if we have one (regardless of loading state)
              if (generatedImage) {
                return (
                  <div className="w-full space-y-4">
                    {/* Full-width image without frame */}
                    <div className="relative w-full">
                      <img
                        src={generatedImage}
                        alt="Story illustration"
                        className="w-full h-auto rounded-lg shadow-lg"

                        onError={(e) => {
                          setImageError('Failed to load image');
                          setIsGeneratingImage(false);
                        }}
                      />
                      
                      {/* Minimal download button - just icon */}
                      <button
                        onClick={() => {
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
                return (
                  <div className="text-center py-8">
                    <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">
                        <TranslatedText>Sorry, we couldn't create the illustration. Please try again.</TranslatedText>
                      </p>
                    </div>
                  </div>
                );
              }

              // Priority 3: Show loading indicator only if we don't have an image yet
              if (isGeneratingImage) {
                return (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600"></div>
                  </div>
                );
              }

              return null;
            })()}
          </motion.div>
        );
      })()}
    </motion.div>
  );
};

export default StorytellingSession; 