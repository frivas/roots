# Roots - AI-Powered Educational Platform

Roots is a next-generation educational platform that combines traditional educational services with cutting-edge AI technology. The platform features AI-powered tutoring, real-time illustration generation, multilingual support, and comprehensive family services.

## 🚀 Key Features

### AI-Powered Learning
- **Interactive Storytelling** with real-time DALL-E 3 illustration generation
- **Chess Coaching** with AI grandmaster
- **Math Tutoring** with personalized AI assistance
- **Language Lessons** with conversational AI tutors
- **Parent Wellness Coaching** with 24/7 AI support

### Advanced Localization
- **Hybrid Translation System** with 900+ local translations
- **Real-time Language Switching** (English/Spanish)
- **AI-Powered Dynamic Translation** via Lingo.dev
- **Regional Customization** for Spanish users (dates, phones, timezone)

### Real-Time Communication
- **Server-Sent Events (SSE)** for live updates
- **WebHook Integration** with ElevenLabs
- **Multi-language Voice Agents**
- **Real-time Illustration Broadcasting**

### Comprehensive Services
- Educational services management
- Parent coaching and wellness programs
- Extracurricular activities (physical and online)
- Transportation and cafeteria management
- Academic counseling and mentorship

## 🏗️ Architecture

### Project Structure
```
roots/
├── frontend/                 # React 19 application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Translation)
│   │   ├── pages/           # Application pages
│   │   │   └── services/    # AI-powered service pages
│   │   ├── services/        # Business logic services
│   │   ├── hooks/           # Custom React hooks
│   │   └── config/          # Configuration files
│   └── package.json
├── backend/                 # Node.js API with Fastify
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── lib/             # Shared libraries
│   │   └── types/           # TypeScript definitions
│   └── package.json
├── .documentation/          # Comprehensive documentation
├── scripts/                 # Utility scripts
└── supabase/               # Database migrations
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Clerk Authentication** for user management
- **Lingo.dev SDK** for AI translation
- **Vite** for build tooling

### Backend
- **Node.js** with **Fastify** framework
- **TypeScript** for type safety
- **Clerk Authentication** for server-side auth
- **Supabase** for database management
- **Server-Sent Events (SSE)** for real-time updates

### AI & External Services
- **ElevenLabs Conversational AI** for voice agents
- **OpenAI DALL-E 3** for image generation
- **Lingo.dev** for dynamic translation
- **Groq API** for language processing

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm or yarn**
- **PostgreSQL database** (via Supabase)
- **API Keys**: OpenAI, ElevenLabs, Lingo.dev/Groq, Clerk

### Environment Setup

Create `.env` files in both frontend and backend directories:

#### Frontend (.env)
```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_GROQ_API_KEY=your_groq_api_key
```

#### Backend (.env)
```bash
CLERK_SECRET_KEY=your_clerk_secret_key
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_anon_key
PORT=3000
```

### Installation & Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd roots
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development servers**
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run individually
npm run dev:frontend  # React app on port 5173
npm run dev:backend   # API server on port 3000
```

### Database Setup

The project uses Supabase for PostgreSQL hosting:

1. **Create a Supabase project**
2. **Run migrations**
```bash
cd supabase
supabase db push
```

3. **Update environment variables** with your Supabase credentials

## 🎯 AI Services Setup

### ElevenLabs Configuration
1. Create an ElevenLabs account
2. Create conversational AI agents for each service:
   - Storytelling: `agent_01jxy9664recb9nx14y9mj685n`
   - Chess: `agent_01jxy432zjfq7rywx4wm7md5hh`
   - Math: `agent_01jxy66c6tfsaadxfv6a1snq06`
   - Language: `agent_01jxy264qbe49b8f3rk71wnzn7`
   - Wellness: `agent_01jxkwsqkxe1nsztm4h461ahw0`

### Webhook Configuration
For local development with ngrok:
```bash
# Install and start ngrok
npm install -g ngrok
ngrok http 3000

# Update ElevenLabs webhook URLs to:
# https://your-ngrok-url.ngrok-free.app/api/images/generate-for-story
```

## 📚 Key Features Documentation

- **[Implementation Summary](.documentation/implementation-summary.md)** - Complete feature overview
- **[Storytelling Feature](.documentation/storytelling-illustration-feature.md)** - Real-time illustration system
- **[Localization Guide](.documentation/localization-guide.md)** - Translation system usage
- **[Madrid Branding](.documentation/madrid-branding-guide.md)** - Design guidelines

## 🧪 Quality Assurance

### Automated Checks
```bash
# Check for untranslated strings
npm run check-localization

# Run linting
npm run lint

# Pre-commit validation
npm run pre-commit
```

### Translation Testing
- Use the Translation Debugger (available on Dashboard)
- Test language switching between English and Spanish
- Verify regional format changes (dates, phone numbers)

## 🚀 Deployment

### Production Build
```bash
# Build both frontend and backend
npm run build

# Individual builds
npm run build:frontend
npm run build:backend
```

### Production Environment
- Update webhook URLs from ngrok to production domain
- Configure SSL certificates for HTTPS (required by ElevenLabs)
- Set up rate limiting and monitoring
- Configure CDN for static assets

## 🔧 Development Tools

- **Concurrently**: Parallel dev server execution
- **Vite**: Fast frontend development and building
- **TypeScript**: Type safety across the stack
- **ESLint**: Code quality enforcement
- **Framer Motion**: Animation and transitions

## 📱 Supported Platforms

- **Web Browsers**: Chrome, Firefox, Safari, Edge
- **Languages**: English (US), Spanish (ES)
- **Voice Agents**: Support for 5+ languages
- **Devices**: Desktop, tablet, mobile responsive

## 🤝 Contributing

1. Follow the localization requirements in `.cursorrules`
2. Wrap all user-facing text with `<TranslatedText>`
3. Add Spanish translations to `SpanishTranslations.ts`
4. Test with Translation Debugger before committing
5. Run pre-commit checks: `npm run pre-commit`

## 📄 License

[MIT](LICENSE)

---

**Built with ❤️ using React 19, Fastify, and AI technologies**  
*Next-generation educational platform for the digital age*