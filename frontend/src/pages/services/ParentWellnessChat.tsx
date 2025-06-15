// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { ArrowLeft } from 'lucide-react';

const ParentWellnessChat: React.FC = () => {
  const navigate = useNavigate();
  const [isElevenLabsLoaded, setIsElevenLabsLoaded] = useState(false);

  // Load ElevenLabs widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://unpkg.com/@elevenlabs/convai-widget-embed?t=${Date.now()}`;
    script.async = true;
    script.type = 'text/javascript';
    script.onload = () => setIsElevenLabsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src*="@elevenlabs/convai-widget-embed"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="p-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/services/parent-wellness')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Wellness</TranslatedText>
        </Button>
      </div>

      {/* ElevenLabs Widget - Will appear in bottom-right corner */}
      {isElevenLabsLoaded && (
        <div 
          dangerouslySetInnerHTML={{
            __html: `<elevenlabs-convai 
              agent-id="agent_01jxkwsqkxe1nsztm4h461ahw0"
            ></elevenlabs-convai>`
          }}
        />
      )}
    </div>
  );
};

export default ParentWellnessChat; 