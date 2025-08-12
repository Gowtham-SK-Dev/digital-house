# Digital House - Community Networking Platform

## Overview

Digital House is a community-based social networking platform designed to reconnect community members globally. The platform provides dedicated spaces for personal networking, business promotion, job opportunities, matrimony, and real-time help requests. It promotes cultural events, education, and entrepreneurship while enabling both social interactions and professional growth.

The application is built as a full-stack TypeScript web application using modern development practices and follows a modular, domain-based architecture pattern.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Components**: Radix UI primitives with custom shadcn/ui component library
- **Styling**: TailwindCSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with type-safe database queries
- **API Design**: RESTful API with `/api/v1` prefix and consistent JSON response format
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Schema Structure**: Normalized relational design with proper foreign key relationships
- **Key Tables**: users, posts, connections, events, help_requests, messages with supporting tables for likes, comments, and RSVPs

### Authentication & Authorization
- **Primary Auth**: Replit OpenID Connect with passport.js strategy
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Middleware**: Custom authentication middleware for route protection
- **User Roles**: Role-based access with individual, business, and organization types

### Data Layer
- **Storage Interface**: Abstract storage interface with concrete implementations
- **Repository Pattern**: Centralized data access methods for each domain
- **Type Safety**: Full TypeScript integration with Drizzle's type inference
- **Query Optimization**: Efficient queries with proper indexing and relationships

### API Architecture
- **Route Organization**: Modular route handlers grouped by domain
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Input Validation**: Zod schemas for request validation
- **Response Format**: Consistent JSON response structure with data, message, and error fields

### Development Tooling
- **Build System**: Vite for frontend bundling and esbuild for backend compilation
- **Code Quality**: TypeScript strict mode with path aliases for clean imports
- **Development Server**: Hot module reloading with Vite middleware integration
- **Environment**: Environment-based configuration with proper secret management

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with automatic migrations

### Authentication Services  
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Node.js

### UI & Styling
- **Radix UI**: Headless, accessible UI component primitives
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **TanStack Query**: Server state management and caching
- **Wouter**: Minimalist client-side routing library

### Session & Storage
- **connect-pg-simple**: PostgreSQL session store for Express
- **Express Session**: Session middleware for user authentication state

### Validation & Forms
- **Zod**: TypeScript-first schema validation
- **React Hook Form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Integration between React Hook Form and Zod validation