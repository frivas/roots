// @ts-nocheck
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import TranslatedText from '../../components/TranslatedText';
import { MessageSquare, Construction } from 'lucide-react';

const CommunicationsPlaceholder: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2) {
      return segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Communications Section';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            <TranslatedText>{getPageTitle(location.pathname)}</TranslatedText>
          </h1>
          <p className="text-muted-foreground">
            <TranslatedText>Communications section - Coming soon</TranslatedText>
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Construction className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">
            <TranslatedText>Page Under Development</TranslatedText>
          </CardTitle>
          <CardDescription>
            <TranslatedText>This page is currently being developed and will be available soon.</TranslatedText>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            <TranslatedText>Current path:</TranslatedText> <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationsPlaceholder; 