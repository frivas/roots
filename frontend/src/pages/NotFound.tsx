import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import TranslatedText from '../components/TranslatedText';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
      <div className="space-y-6 max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">
          <TranslatedText>Page Not Found</TranslatedText>
        </h2>
        <p className="text-muted-foreground">
          <TranslatedText>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</TranslatedText>
        </p>
        <Link to="/home">
          <Button leftIcon={<Home className="h-4 w-4" />}>
            <TranslatedText>Return to Home</TranslatedText>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
