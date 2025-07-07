# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartRecipe is an AI-driven recipe generation app that combines refrigerator inventory with supermarket sale information to provide personalized recipe suggestions. The app uses OCR and AI hybrid processing to automatically extract product information from sale flyers and suggest cost-effective recipes.

## Key Architecture Patterns

### Monorepo Structure
- **Frontend**: React 18 + TypeScript + Vite in `apps/frontend/`
- **Backend**: Express + TypeScript (ESM) in `apps/backend/`
- **Database**: Supabase with PostgreSQL + RLS in `database/`
- **Shared**: Common types in `packages/`

### Backend Architecture
- **Service-oriented**: Clear separation in `/services/` (AI, OCR, image processing)
- **API Routes**: RESTful endpoints in `/routes/`
- **Middleware**: Auth, error handling, logging in `/middleware/`
- **Hybrid Processing**: OCR → AI structuring with vision fallback

### Frontend Architecture
- **React 18**: Functional components with hooks
- **State Management**: Zustand (client) + TanStack Query (server)
- **Component Structure**: Page-based routing with feature components
- **Direct Supabase**: Simple operations bypass Express API

### Database Design
- **Supabase PostgreSQL**: Row Level Security (RLS) enabled
- **Key Tables**: user_profiles, inventory, sales_info, recipes, cooking_history
- **JSONB Fields**: Flexible structured data storage
- **Custom Functions**: Business logic in database (expiry calculations, cost calculations)

## Essential Commands

### Development
```bash
# Start all services
npm run dev

# Individual services
npm run dev:frontend    # localhost:3000
npm run dev:backend     # localhost:3001

# Database operations
npm run db:start        # Start local Supabase
npm run db:stop         # Stop local Supabase
npm run db:reset        # Reset database with migrations
npm run db:studio       # Open Supabase Studio GUI
npm run db:types        # Generate TypeScript types
```

### Code Quality
```bash
# Essential checks before committing
npm run lint            # ESLint check
npm run typecheck       # TypeScript check
npm run format          # Prettier formatting

# Fix issues
npm run lint:fix        # Auto-fix ESLint issues
```

### Testing
```bash
npm test               # Run all tests
npm run test:unit      # Unit tests only
npm run test:watch     # Watch mode for development
npm run test:coverage  # Coverage report
```

### Build
```bash
npm run build          # Build all applications
npm run build:frontend # Build frontend only
npm run build:backend  # Build backend only
```

## Key Service Patterns

### AI Processing (GeminiService)
- **Primary**: Gemini 2.0 Flash for text structuring and image processing
- **Structured Output**: JSON with validation and error handling
- **Fallback Strategy**: OCR → AI structuring OR direct vision processing
- **Prompt Engineering**: Sophisticated prompts in Japanese for sale data extraction

### Image Processing Pipeline
1. **Upload**: Multer with memory storage (10MB limit)
2. **Process**: Sharp for image preprocessing
3. **OCR**: Google Cloud Vision API (optional)
4. **AI**: Gemini for structuring or direct vision processing
5. **Store**: Supabase Storage with user-isolated paths

### Database Operations
- **Direct Supabase**: Simple CRUD operations
- **Express API**: Complex processing (OCR, AI, image handling)
- **RLS Policies**: User isolation enforced at database level
- **Type Safety**: Generated types from Supabase schema

## File Organization

### Backend (`apps/backend/src/`)
- `routes/` - API endpoint definitions
- `services/` - Business logic (ai/, ocr/, recipe/, image processing)
- `middleware/` - Cross-cutting concerns (auth, error handling)
- `config/` - Environment and service configuration
- `types/` - TypeScript interfaces
- `utils/` - Shared utilities

### Frontend (`apps/frontend/src/`)
- `pages/` - Page components with routing
- `components/` - UI components (ui/, forms/, layout/, feature/)
- `hooks/` - Custom React hooks
- `services/` - API clients and Supabase integration
- `stores/` - Zustand state management
- `types/` - TypeScript interfaces

### Database (`database/`)
- `migrations/` - SQL migration files
- `schema.sql` - Complete database schema
- `seeds/` - Sample data for development

## Common Development Patterns

### Error Handling
- **Custom Classes**: `AppError`, `ValidationError` with status codes
- **Consistent Format**: `{ success: boolean, data?: T, error?: string }`
- **Centralized Middleware**: Error handling in backend middleware
- **User-Friendly Messages**: Meaningful error messages for frontend

### Authentication
- **Supabase Auth**: JWT tokens with automatic refresh
- **RLS Enforcement**: Database-level security
- **Route Protection**: Auth middleware for protected endpoints
- **Frontend Auth**: Auth store with real-time listeners

### Type Safety
- **Strict TypeScript**: Enabled for both frontend and backend
- **Generated Types**: Database types from Supabase schema
- **Interface Definitions**: Consistent API response types
- **Path Aliases**: `@/*` for internal imports, `@shared/*` for cross-package

## Environment Setup

### Required Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GEMINI_API_KEY` - Google Gemini API key
- `GOOGLE_CLOUD_PROJECT_ID` - Google Cloud project ID (for OCR)

### Development Setup
1. `npm install` - Install dependencies
2. Copy `.env.example` to `.env` and configure
3. `npm run db:start` - Start local Supabase
4. `npm run db:reset` - Initialize database
5. `npm run dev` - Start development servers

## Testing Strategy

### Frontend Testing
- **Vitest**: Test runner with jsdom environment
- **Testing Library**: React component testing
- **Test Location**: `__tests__/` or `.test.tsx` files

### Backend Testing
- **Vitest**: Unit and integration tests
- **Supertest**: API endpoint testing
- **Test Database**: Separate test database setup

## Common Troubleshooting

### Database Issues
```bash
# Check Supabase status
npm run db:status

# Reset if corrupted
npm run db:stop
npm run db:start
npm run db:reset
```

### Port Conflicts
- Frontend: 3000 (Vite dev server)
- Backend: 3001 (Express server)
- Supabase: 54321 (API), 54323 (Studio)

### Type Generation
```bash
# Regenerate database types if schema changes
npm run db:types
```

## Performance Considerations

- **Image Processing**: Sharp for optimization before storage
- **Database Indexing**: Indexes on user_id, expiry_date, created_at
- **Query Optimization**: Direct Supabase for simple operations
- **Caching**: TanStack Query for API responses
- **Bundle Size**: Vite's tree shaking and code splitting

## AI Integration Notes

- **Gemini 2.0 Flash**: Primary AI service for text and vision processing
- **Structured Output**: JSON format with validation
- **Rate Limiting**: Implement retry with exponential backoff
- **Cost Optimization**: Use OCR + AI structuring when possible, fallback to direct vision
- **Prompt Engineering**: Detailed prompts in Japanese for accurate extraction

## Security Considerations

- **Row Level Security**: Enabled on all user tables
- **File Upload Security**: Mime type validation, size limits
- **API Authentication**: JWT tokens required for protected routes
- **Environment Variables**: Never commit secrets to repository
- **CORS Configuration**: Proper origin restrictions