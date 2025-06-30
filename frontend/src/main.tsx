// @ts-nocheck
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { LingoTranslationProvider } from './contexts/LingoTranslationContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

// Get the publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error('Missing Clerk publishable key');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LingoTranslationProvider>
        <ClerkProvider publishableKey={clerkPubKey}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ClerkProvider>
      </LingoTranslationProvider>
    </ErrorBoundary>
  </StrictMode>
);
