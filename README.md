# Roots - Educational Services Platform

Roots is a comprehensive web application designed to manage educational services including classroom management, transportation tracking, cafeteria services, extracurricular activities, language support, and mentorship programs.

## Project Structure

The project is structured into two main folders:

- `frontend/`: React application with TypeScript
- `backend/`: Node.js API with Fastify and TypeScript

## Features

- Authentication with Clerk
- Role-based access control
- Real-time messaging
- Notifications system
- Services management
- Account settings

## Technology Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Clerk Authentication
- Socket.io Client

### Backend
- Node.js
- Fastify
- TypeScript
- Prisma ORM
- Socket.io
- Clerk Authentication
- Supabase (for database)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

- Copy `.env.example` to `.env` in both frontend and backend folders
- Fill in the required values

### Development

To run the development servers:

```bash
# Run frontend and backend concurrently
npm run dev

# Run only frontend
npm run dev:frontend

# Run only backend
npm run dev:backend
```

## Database Setup

The project uses Prisma ORM with PostgreSQL. To set up the database:

1. Make sure PostgreSQL is running
2. Update the `DATABASE_URL` in the backend `.env` file
3. Run database migrations:

```bash
cd backend
npx prisma migrate dev
```

## Authentication

The application uses Clerk for authentication. You'll need to:

1. Create a Clerk account
2. Set up an application in Clerk dashboard
3. Add the Clerk publishable key to frontend `.env` file
4. Add the Clerk secret key to backend `.env` file

## Deployment

### Frontend

The frontend can be built for production:

```bash
cd frontend
npm run build
```

### Backend

The backend can be built for production:

```bash
cd backend
npm run build
```

## License

[MIT](LICENSE)