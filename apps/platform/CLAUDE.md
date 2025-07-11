# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio (if configured)

## Architecture Overview

This is a Next.js 15 application with the following key architectural components:

### Authentication & Authorization

- **Better Auth**: Primary authentication system using `better-auth` v1.2.12
- **Database Integration**: Uses Drizzle adapter with PostgreSQL
- **Email Verification**: Required for new signups via Resend
- **Multi-tenant**: Organization plugin enabled for multi-tenant architecture
- **Admin Features**: Admin plugin enabled for user management

### Database Layer

- **ORM**: Drizzle ORM with PostgreSQL
- **Schema Location**: `db/schema/` (uses barrel exports via `db/schema/index.ts`)
- **Migrations**: Located in `migrations/` directory
- **Connection**: Database instance exported from `db/drizzle.ts` with schema configuration

### Core Authentication Tables

- `user` - User accounts with email verification, roles, and ban functionality
- `session` - User sessions with IP tracking and organization context
- `account` - OAuth/external account links
- `verification` - Email verification tokens
- `organization` - Multi-tenant organization management
- `member` - Organization memberships
- `invitation` - Organization invitations

### Server Actions Pattern

- **Location**: `lib/actions/` directory
- **Error Handling**: Uses consistent `{success: boolean, data?: any, message?: string, fieldErrors?: Record<string, string[]>}` response format
- **Validation**: Zod schemas in `lib/validations/` for input validation
- **Pre-checks**: Database queries to prevent partial creation failures
- **Better Auth Errors**: Handle `APIError` from `better-auth/api` with specific error codes

### Form Handling

- **React Hook Form**: Primary form library with Zod validation
- **Server Actions**: Forms use `useActionState` for server-side processing
- **Error Display**: Field-specific errors under inputs + toast notifications via Sonner
- **UX**: Form inputs disabled during submission (`isPending` state)

### Email System

- **Service**: Resend for email delivery
- **Configuration**: API key via `RESEND_API_KEY` environment variable
- **Integration**: Integrated with Better Auth for verification emails

### UI Components

- **Framework**: Radix UI primitives with custom styling
- **Design System**: Tailwind CSS v4 with custom theme configuration
- **Toast Notifications**: Sonner for user feedback
- **Form Components**: Located in `components/ui/` following shadcn/ui patterns

### Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - Resend API key for email delivery

## Key Development Patterns

### Server Action Error Handling

```typescript
// Always use this response format
return {
  success: false as const,
  message: "User-friendly error message",
  fieldErrors: {
    fieldName: ["Specific field error"],
  },
};
```

### Better Auth Error Handling

```typescript
if (error instanceof AuthError) {
  switch (error.body?.code) {
    case "USER_ALREADY_EXISTS":
    // Handle specific error
    case "ORGANIZATION_ALREADY_EXISTS":
    // Handle specific error
    default:
    // Generic error handling
  }
}
```

### Database Pre-checks

Before creating users or organizations, always check for existing records to prevent partial creation failures.

### Form Pattern

- Use `useActionState` for server actions
- Implement field-specific error handling with `useEffect`
- Clear errors on form submission
- Disable inputs during `isPending` state

## File Organization

- `app/` - Next.js app directory with route structure
- `components/` - React components (UI components in `ui/` subdirectory)
- `lib/` - Utility functions, actions, auth, and validations
- `db/` - Database configuration and schema
- `migrations/` - Drizzle database migrations
- `drafts/` - Design drafts (excluded from Tailwind scanning via `@source not "../drafts"`)

## Database Management

Use Drizzle Kit commands for database operations. The schema is defined in `db/schema/auth.ts` and exported through a barrel file. When making schema changes, always generate and run migrations.

## Authentication Flow

1. User registration creates both user and organization records
2. Email verification is required before account activation
3. Organization slugs are auto-generated from names
4. Better Auth handles session management and cookies
5. Multi-tenant access via organization context in sessions

## Code Style Guidelines

### Variable Declarations
- Always use `let` unless it is a variable that will never change
- Use `const` only for true constants (like `const API_URL = "https://api.example.com"`)

### Function Declarations
- Always use function declarations (`function foo() {}`) for named functions
- Use arrow functions only for:
  - Anonymous event handlers and callbacks
  - Inline functions passed as arguments
  - Functions that need to preserve `this` context
