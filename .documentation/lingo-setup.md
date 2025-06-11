# Lingo.dev JavaScript SDK Setup Guide

This project uses the lingo.dev JavaScript SDK for dynamic localization, supporting English (US) and Spanish (Spain) with local Spanish translations as a fallback.

## Setup Instructions

### 1. Get Your Groq API Key
1. Visit [console.groq.com](https://console.groq.com/) and create an account
2. Get your API key from the console
3. Groq provides the AI models used by lingo.dev SDK for translations

### 2. Configure Environment
Edit `frontend/.env` and set your Groq API key:

```bash
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 3. Test the Setup
Run the development server:

```bash
cd frontend
npm run dev
```

### 4. How It Works

#### Current Implementation Architecture

The project uses a **hybrid translation approach**:

1. **Local Spanish Dictionary** (`SpanishTranslations.ts`) - Instant translations for common UI elements
2. **Lingo.dev SDK** - Dynamic AI-powered translations for new content
3. **Context-based Translation** (`LingoTranslationContext.tsx`) - React context for managing translations
4. **TranslatedText Component** - Wrapper component for translatable text

#### Translation Service Flow

```tsx
// Text translation priorities:
1. Check local Spanish dictionary first (instant)
2. Check translation cache
3. Request from lingo.dev SDK (AI-powered)
4. Fallback to local dictionary if SDK fails
5. Ultimate fallback to original text
```

#### Using Translations

**Method 1: TranslatedText Component**
```tsx
import TranslatedText from '../components/TranslatedText';

<TranslatedText>Welcome to Roots!</TranslatedText>
```

**Method 2: useLingoTranslation Hook**
```tsx
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

const { translateText, language } = useLingoTranslation();
const translatedText = await translateText('Hello World');
```

**Method 3: Direct Service Access**
```tsx
import { lingoTranslationService } from '../services/LingoTranslationService';

const translated = await lingoTranslationService.translateText('Hello', 'es-ES');
```

### 5. Language Configuration

Currently configured languages:
- **Source**: English (US) - `en-US`
- **Target**: Spanish (Spain) - `es-ES`

Languages are managed through:
- `LingoTranslationContext` - React context state
- `LanguageSwitcher` component - UI language selector
- `localStorage` - Persists user language preference

### 6. Local Spanish Translations

The project includes a comprehensive Spanish dictionary (`frontend/src/services/SpanishTranslations.ts`) with over 400 translations covering:

- **Dashboard UI**: Navigation, metrics, quick actions
- **Settings Pages**: Profile, notifications, preferences
- **Educational Content**: Course terms, academic language
- **System Messages**: Alerts, confirmations, errors
- **Regional Localization**: Spanish phone numbers, CET timezone, DD/MM/YYYY date format

#### Adding New Translations

```typescript
// Add to SpanishTranslations.ts
export const spanishTranslations: Record<string, string> = {
  "New English Text": "Nuevo Texto en Español",
  // ... existing translations
};
```

### 7. Features

- ✅ **Instant Local Translations** - 400+ pre-translated phrases
- ✅ **AI-Powered Dynamic Translation** - New content via lingo.dev SDK
- ✅ **Intelligent Fallback System** - Multiple layers of translation reliability
- ✅ **Caching Layer** - Reduces API calls and improves performance
- ✅ **Context-Aware Translation** - Proper React integration
- ✅ **Regional Settings** - Spanish timezone, date formats, phone numbers
- ✅ **Real-time Language Switching** - No page refresh required
- ✅ **User Profile Integration** - Uses actual user data for Spanish examples

### 8. Development Tools

**Translation Debugger Component**
Available at `/` (Dashboard) - Shows translation statistics and testing tools.

**Translation Statistics**
```tsx
const stats = lingoTranslationService.getStats();
// Returns: { cacheSize: number, localTranslationsCount: number }
```

**Cache Management**
```tsx
lingoTranslationService.clearCache(); // Clear runtime cache
```

### 9. Troubleshooting

1. **API Key Issues**: Ensure `VITE_GROQ_API_KEY` is correctly set in `.env`
2. **Translation Failures**: Check browser console for error messages
3. **Missing Translations**: Add to local dictionary or let SDK handle dynamically
4. **Performance Issues**: Use `TranslatedText` component to leverage caching

### 10. File Structure

```
frontend/src/
├── contexts/
│   └── LingoTranslationContext.tsx    # Translation state management
├── services/
│   ├── LingoTranslationService.ts     # Core translation service
│   └── SpanishTranslations.ts         # Local Spanish dictionary
├── components/
│   ├── TranslatedText.tsx            # Translation wrapper component
│   └── TranslationDebugger.tsx       # Development debugging tool
└── pages/
    ├── Settings.tsx                  # Localized settings with Spanish examples
    └── Profile.tsx                   # Localized profile with regional data
```

### 11. Production Considerations

- **Bundle Size**: Local dictionary adds ~15KB to bundle size
- **API Costs**: Local dictionary reduces lingo.dev API usage by ~90%
- **Loading Time**: Instant translations for common UI elements
- **Offline Support**: Local translations work without internet connection

For more information about the lingo.dev SDK, visit the [official documentation](https://lingo.dev/docs/sdk). 