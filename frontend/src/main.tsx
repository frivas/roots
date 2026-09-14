import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'framer-motion';
import { LingoTranslationProvider } from './contexts/LingoTranslationContext';
import ClerkRuntimeBoundary from './components/ClerkRuntimeBoundary';
import App from './App';
import './index.css';

// Get the publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error('Missing Clerk publishable key');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LingoTranslationProvider>
        <BrowserRouter>
          <ClerkRuntimeBoundary publishableKey={clerkPubKey}>
            <App />
          </ClerkRuntimeBoundary>
        </BrowserRouter>
      </LingoTranslationProvider>
    </MotionConfig>
  </StrictMode>
);
