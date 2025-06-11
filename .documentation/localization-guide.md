# 🌍 Localization Quick Reference Guide

## Daily Development Workflow

### 1. **Write Feature in English** (Your Preferred Way)
```tsx
// ✅ Start with regular English development
function MyNewFeature() {
  return (
    <div>
      <h1>My New Feature</h1>
      <Button>Save Changes</Button>
      <p>This is a description of the feature</p>
    </div>
  );
}
```

### 2. **Wrap Strings with TranslatedText**
```tsx
// ✅ Convert to localized version
import TranslatedText from '../components/TranslatedText';

function MyNewFeature() {
  return (
    <div>
      <TranslatedText element="h1">My New Feature</TranslatedText>
      <Button>
        <TranslatedText>Save Changes</TranslatedText>
      </Button>
      <TranslatedText element="p">This is a description of the feature</TranslatedText>
    </div>
  );
}
```

### 3. **Add Common Terms to Spanish Dictionary**
```typescript
// frontend/src/services/SpanishTranslations.ts
export const spanishTranslations: Record<string, string> = {
  // ... existing translations ...
  "My New Feature": "Mi Nueva Funcionalidad",
  "Save Changes": "Guardar Cambios",
  "This is a description of the feature": "Esta es una descripción de la funcionalidad"
};
```

### 4. **Test Your Changes**
```bash
# Check for untranslated strings
npm run check-localization

# Run your app and test language switching
npm run dev
# Go to Dashboard → Switch language → Verify all text translates
```

## 🚀 Quick Commands

```bash
# Check for untranslated strings
npm run check-localization

# Run full pre-commit check
npm run pre-commit

# Install dependencies (if needed)
npm install
```

## 🎯 Common Patterns

### Dynamic Content
```tsx
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

function UserGreeting({ userName }: { userName: string }) {
  const { translateText } = useLingoTranslation();
  
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    translateText(`Welcome back, ${userName}!`).then(setGreeting);
  }, [userName, translateText]);
  
  return <div>{greeting}</div>;
}
```

### Form Placeholders
```tsx
// ✅ Placeholder will be handled by the Input component internally
<Input placeholder="Enter your email" />

// ✅ For labels, wrap with TranslatedText
<label>
  <TranslatedText>Email Address</TranslatedText>
</label>
```

### Error Messages & Toasts
```tsx
// ✅ Always wrap error messages
const handleError = async (error: string) => {
  const translatedError = await translateText(error);
  toast.error(translatedError);
};

// or in JSX:
{error && (
  <div className="error">
    <TranslatedText>{error}</TranslatedText>
  </div>
)}
```

## 🔍 Before You Commit

### Pre-Commit Checklist
- [ ] `npm run check-localization` passes
- [ ] All user-facing strings wrapped with `TranslatedText`
- [ ] Common terms added to `SpanishTranslations.ts`
- [ ] Tested language switching (EN ↔ ES)
- [ ] Regional formats work (dates, phone numbers)

### Test Language Switching
1. Go to your feature in English
2. Switch to Spanish (look for language switcher)
3. Verify all text translates properly
4. Check that dates/times show in Spanish format

## 📚 Available Translation Components

### TranslatedText Component
```tsx
// Basic usage
<TranslatedText>Hello World</TranslatedText>

// With HTML element
<TranslatedText element="h1" className="text-2xl">Page Title</TranslatedText>

// With loading indicator
<TranslatedText showLoader>Loading content...</TranslatedText>
```

### Translation Hook
```tsx
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

const { 
  language,           // Current language ('en-US' | 'es-ES')
  setLanguage,        // Change language
  isTranslating,      // Is currently translating
  translateText,      // Async translation function
  preloadingComplete  // Are common translations loaded
} = useLingoTranslation();
```

### Translation Service (Direct)
```tsx
import { lingoTranslationService } from '../services/LingoTranslationService';

// Direct translation
const translated = await lingoTranslationService.translateText('Hello', 'es-ES');

// Batch translation
const translatedObj = await lingoTranslationService.translateObject({
  title: 'Welcome',
  description: 'This is a description'
}, 'es-ES');
```

## 🐛 Debugging Translations

### Translation Debugger (Available on Dashboard)
- View translation statistics
- Test individual translations
- Monitor cache performance
- Clear translation cache

### Console Logs
The system logs all translation activity:
- `✅ Using local Spanish translation` - Fast local dictionary
- `🔍 Using cached translation` - Previously translated
- `🌐 Requesting Lingo.dev translation` - API call to Lingo.dev
- `🔄 Fallback to local Spanish translation` - API failed, using local

## 🆘 Common Issues

### "My text isn't translating"
1. Check if wrapped with `<TranslatedText>`
2. Verify Spanish dictionary has the translation
3. Clear cache and try again
4. Check browser console for errors

### "Language switching doesn't work"
1. Verify language switcher is working
2. Check if `LingoTranslationProvider` wraps your app
3. Look for console errors
4. Test with Translation Debugger

### "Regional formats not working"
1. Check Settings page for Spanish locale
2. Verify date/time formatting in Spanish mode
3. Test phone number format (+34 vs +1)

---

**🎯 Remember: Every new feature should work perfectly in both English and Spanish!** 