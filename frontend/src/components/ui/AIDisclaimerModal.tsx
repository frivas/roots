import React from 'react';
import { X, Bot } from 'lucide-react';
import TranslatedText from '../TranslatedText';

interface AIDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIDisclaimerModal: React.FC<AIDisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">
              <TranslatedText>AI Service Notice</TranslatedText>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            <TranslatedText>
              AI-generated content may contain inaccuracies. Use at your own discretion.
            </TranslatedText>
          </p>
          <p className="text-xs text-gray-500 mt-3">
            <TranslatedText>
              This applies to all AI-powered services including voice conversations, 
              story illustrations, and educational content.
            </TranslatedText>
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <TranslatedText>Understood</TranslatedText>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDisclaimerModal; 