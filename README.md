<!-- Badges: see .github/BADGES.md for more -->

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/frivas/roots)](https://github.com/frivas/roots/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/frivas/roots)](https://github.com/frivas/roots/commits/main)
[![CI](https://github.com/frivas/roots/actions/workflows/ci.yml/badge.svg)](https://github.com/frivas/roots/actions/workflows/ci.yml)
[![Security Audit](https://github.com/frivas/roots/actions/workflows/security.yml/badge.svg)](https://github.com/frivas/roots/actions/workflows/security.yml)
[![Gitleaks](https://github.com/frivas/roots/actions/workflows/gitleaks.yml/badge.svg)](https://github.com/frivas/roots/actions/workflows/gitleaks.yml)

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

- **Local Translation System** with 900+ checked-in translations
- **Real-time Language Switching** (English/Spanish)
- **Lazy Dictionary Loading** when Spanish text is first requested
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
│   ├── vercel.json         # Vercel deployment config
│   └── package.json
├── netlify.toml             # Netlify deployment config
└── docs/deployment/         # Deployment and release contracts
```

## 🛠️ Technology Stack

### Frontend

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Clerk Authentication** for user management
- **Checked-in Spanish dictionary** for deterministic translation
- **Vite** for build tooling
- **Deployed on Netlify**

### Backend

- **Node.js** with **Fastify** framework
- **TypeScript** for type safety
- **Clerk Authentication** for server-side auth
- **Server-Sent Events (SSE)** for real-time updates
- **Deployed on Vercel**

### AI & External Services

- **ElevenLabs Conversational AI** for voice agents
- **OpenAI DALL-E 3** for image generation

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm or yarn**
- **PostgreSQL database** (via Supabase)
- **API Keys**: OpenAI, ElevenLabs, and Clerk

### Environment Setup

Create `.env` files in both frontend and backend directories:

#### Frontend (.env)

```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:3000
```

#### Backend (.env)

```bash
ROOTS_BACKEND_MODE=demo
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
ELEVENLABS_WEBHOOK_SECRET=your_elevenlabs_webhook_secret
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Demo mode needs only the server, Clerk, and frontend URL settings. Supabase,
OpenAI, and the ElevenLabs webhook secret are required when
`ROOTS_BACKEND_MODE=connected`.

### Installation & Development

1. **Clone the repository**

```bash
git clone https://github.com/your-username/roots.git
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
npm run dev:frontend  # React app on http://localhost:5173
npm run dev:backend   # API server on http://localhost:3000
```

### Database Setup

The project uses Supabase for PostgreSQL hosting:

1. **Create a Supabase project**
2. **Apply database migrations** (migrations are included in `supabase/migrations/`)
3. **Update environment variables** with your Supabase credentials

## 🎯 AI Services Setup

### ElevenLabs Configuration

1. Create an ElevenLabs account
2. Create conversational AI agents for each service:

   - Storytelling: `agent_YOUR_STORYTELLING_AGENT_ID`
   - Chess: `agent_YOUR_CHESS_AGENT_ID`
   - Math: `agent_YOUR_MATH_AGENT_ID`
   - Language: `agent_YOUR_LANGUAGE_AGENT_ID`
   - Wellness: `agent_YOUR_WELLNESS_AGENT_ID`
   - Progress Interpretation: `agent_YOUR_PROGRESS_INTERPRETATION_AGENT_ID`

3. Update the agent IDs in `frontend/src/config/agentConfig.ts`:

```typescript
export const AGENT_IDS = {
  storytelling: "agent_YOUR_STORYTELLING_AGENT_ID",
  chess: "agent_YOUR_CHESS_AGENT_ID",
  math: "agent_YOUR_MATH_AGENT_ID",
  language: "agent_YOUR_LANGUAGE_AGENT_ID",
  wellness: "agent_YOUR_WELLNESS_AGENT_ID",
  progress_interpretation: "agent_YOUR_PROGRESS_INTERPRETATION_AGENT_ID"
};
```

### Webhook Configuration

For local development with ngrok:

```bash
# Install and start ngrok
npm install -g ngrok
ngrok http 3000

# Update ElevenLabs webhook URLs to:
# https://your-ngrok-url.ngrok-free.app/webhook/elevenlabs/story-illustration
```

4. Configure each agent's webhook URL in ElevenLabs dashboard:
   - Set webhook URL to: `https://your-domain.com/api/images/generate-for-story`
   - For local development: `https://your-ngrok-url.ngrok-free.app/api/images/generate-for-story`

## 📡 API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `GET /events/story-illustrations` - SSE endpoint for real-time story illustrations
- `POST /webhook/elevenlabs/story-illustration` - ElevenLabs webhook for story generation

### Protected Endpoints (require authentication)

- `GET /api/auth/me` - Get current user profile
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `GET /api/notifications` - Get notifications
- `GET /api/services` - Get available services
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 📚 Deployment Documentation

- **[Integration contracts](docs/deployment/integration-contracts.md)** - Clerk, Supabase, and serverless verification
- **[Release and rollback](docs/deployment/release-and-rollback.md)** - Exact-SHA deployment verification procedure

## 🧪 Quality Assurance

### Automated Checks

```bash
# Check for untranslated strings
npm run check-localization

# Run linting
npm run lint

# Pre-commit validation
npm run pre-commit

# Check for duplicate translation keys
./frontend/remove_duplicates_translations.sh
```

### Translation Testing

- Use the Translation Debugger (available on Dashboard)
- Test language switching between English and Spanish
- Verify regional format changes (dates, phone numbers)
- Check for duplicate translation keys with the provided script

### Translation Utilities

The project includes several utilities for managing translations:

- **Localization Checker**: `npm run check-localization` - Scans for untranslated strings
- **Duplicate Key Checker**: `./frontend/remove_duplicates_translations.sh` - Finds duplicate keys in SpanishTranslations.ts
- **Translation Debugger Component**: Visual interface for testing translations in the browser

## 🚀 Deployment

### Architecture

- **Frontend**: Deployed on Netlify with automatic builds
- **Backend**: Deployed on Vercel with serverless functions
- **Database**: Hosted on Supabase
- **CDN**: Automatic via Netlify/Vercel

### Production Build

```bash
# Build both frontend and backend
npm run build

# Individual builds
npm run build:frontend  # Creates dist/ folder
npm run build:backend   # Creates dist/ folder with compiled TypeScript
```

### Environment Configuration

- Update webhook URLs from ngrok to production domain
- Configure SSL certificates for HTTPS (required by ElevenLabs)
- Set up rate limiting and monitoring
- Configure proper environment variables for production

The required provider variables, alert hook, preview isolation, release
evidence, and rollback commands are defined in
`docs/runbooks/production-operations.md`.

Production deployment is performed by the connected Netlify and Vercel Git
integrations from the protected `main` branch. Do not deploy a local working
tree directly; the deployed revision must remain traceable to a verified SHA.

## 🔧 Development Tools

- **Concurrently**: Parallel dev server execution
- **Vite**: Fast frontend development and building
- **TypeScript**: Type safety across the stack
- **ESLint**: Code quality enforcement
- **Framer Motion**: Animation and transitions
- **Custom Localization Checker**: Automated translation validation

## 📱 Supported Features

- **Web Browsers**: Chrome, Firefox, Safari, Edge (modern versions)
- **Languages**: English (US), Spanish (ES) with a lazily loaded local dictionary
- **Voice Agents**: Real-time conversational AI in multiple languages
- **Devices**: Fully responsive design for desktop, tablet, and mobile
- **Real-time Features**: SSE for live story illustrations
- **Authentication**: Clerk-based user management

## 🤝 Contributing

1. Follow the localization requirements in `.cursorrules`
2. Wrap all user-facing text with `<TranslatedText>`
3. Add Spanish translations to `frontend/src/services/SpanishTranslations.ts`
4. Test with Translation Debugger before committing
5. Run pre-commit checks: `npm run pre-commit`
6. Ensure TypeScript types are properly defined
7. Follow the existing code patterns and architecture

## Team

![Chapa Badge](https://chapa.thecreativetoken.com/u/juan294/badge.svg)

## 📄 License

[Apache-2.0](LICENSE)

---

**Built with ❤️ using React 19, Fastify, and AI technologies**
_Next-generation educational platform for the digital age_
