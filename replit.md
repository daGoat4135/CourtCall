# CourtCall - Volleyball Scheduling App

## Overview

CourtCall is a lightweight internal web application designed to solve the friction in organizing volleyball matches at a company sand court. The application transforms irregular, hard-to-coordinate games into a streamlined scheduling system with automated reminders, clear visibility into player participation, and gamification elements to encourage consistent play.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom court-themed color palette
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: PostgreSQL-based session storage
- **API Design**: RESTful API with Express routes

### Build and Development
- **Development**: Vite dev server with HMR and Express middleware
- **Production**: ESBuild for server bundling, Vite for client bundling
- **TypeScript**: Strict mode enabled with path aliases for clean imports

## Key Components

### Database Schema
The application uses four main tables:
- **Users**: Store user profiles with department and avatar information
- **Matches**: Core scheduling entity with date, time, type, and player limits
- **RSVPs**: Junction table tracking player participation in matches
- **Notifications**: Scheduled reminders and match updates

### UI Components
- **Weekly Calendar**: Main scheduling interface showing Monday-Friday matches
- **Match Cards**: Individual match display with RSVP functionality
- **Leaderboard**: Gamification element showing player participation stats
- **Create Match Dialog**: Form for scheduling new matches with recurring options
- **Stats Dashboard**: Overview of games played and active players

### Data Flow
1. **Match Creation**: Users create matches through dialog form, validated with Zod schemas
2. **RSVP Management**: Players join/leave matches with real-time updates
3. **Notification System**: Automatic reminders sent 2 hours and 30 minutes before matches
4. **Analytics**: Player statistics and leaderboard calculations from RSVP data

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database operations and migrations
- **@tanstack/react-query**: Server state management and caching
- **date-fns**: Date manipulation and formatting utilities
- **@radix-ui**: Accessible UI primitives for components

### Development Tools
- **Vite**: Fast development server and build tool
- **ESBuild**: Server-side bundling for production
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety across the entire application

## Data Storage

### Primary Database
- **PostgreSQL**: Main data store using Neon serverless database
- **Drizzle ORM**: Provides type-safe queries and automatic migrations
- **Session Storage**: PostgreSQL-based session management with connect-pg-simple

### State Management
- **TanStack Query**: Handles server state caching, background updates, and optimistic updates
- **React State**: Local component state for UI interactions
- **Form State**: React Hook Form manages form validation and submission

## Deployment Strategy

### Build Process
1. **Client Build**: Vite builds React app to `dist/public`
2. **Server Build**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Vite dev server with Express middleware integration
- **Production**: Standalone Express server serving static files
- **Database**: Environment-based connection string configuration

### Key Features
- **Replit Integration**: Configured for Replit deployment with development banner
- **Error Handling**: Runtime error overlay in development
- **Asset Management**: Proper path resolution for static assets
- **Session Security**: Secure session configuration for production

The application follows a monorepo structure with clear separation between client, server, and shared code, making it maintainable and scalable for the specific use case of internal volleyball scheduling.