# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Assignment Management System (アサイン管理システム) built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. The system manages sales staff assignments, tracks revenue/profit, and provides analytics for sales teams.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.4.6 with App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email/password and social logins
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Project Structure
- `/assign-management/` - Main Next.js application
  - `/app/` - App Router pages and layouts
    - `/(protected)/` - Authenticated routes (dashboard, assignments, mypage, reports)
    - `/login/` - Authentication page
  - `/components/` - Shared React components
  - `/lib/supabase/` - Supabase client configuration
  - `/types/` - TypeScript type definitions including database schema

### Database Schema
Key tables defined in Supabase:
- `profiles` - User profiles linked to auth.users
- `departments` - Department master data
- `assignments` - Assignment information with project/staff details
- `companies` - Client and vendor companies
- `sales_records` - Monthly sales aggregation
- `comments` - Assignment comments
- `targets` - Sales targets by individual/department/company

### Authentication Flow
1. Middleware (`middleware.ts`) handles session management
2. Protected routes under `/(protected)/` require authentication
3. User roles: admin, leader, member with different permissions

### Profit Calculation Logic
- Revenue = Daily Rate × Working Days
- Cost = Wholesale Rate × Working Days
- Gross Profit = Revenue - Cost
- Project Manager Profit = Gross Profit × 50%
- Staff Manager Profit = Gross Profit × 50%

## Key Implementation Details

### Supabase Integration
- Client creation uses `@supabase/ssr` for server-side rendering support
- Database types are defined in `/types/database.ts`
- Row Level Security policies enforce access control

### Form Handling
- Assignment forms use React Hook Form with Zod schemas
- Date handling for spot (specific dates) vs continuous (monthly) assignments
- Dynamic company and staff manager selection

### State Management
- Server Components fetch data directly from Supabase
- Client Components use hooks for real-time updates
- Form state managed by React Hook Form

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Testing Approach

Check for test scripts in package.json. If tests exist, run with `npm test`. For new features, follow existing test patterns in the codebase.

## Important Considerations

1. **RLS Policies**: All database operations respect Row Level Security. Ensure proper user context when querying.

2. **Date Handling**: Work months stored as DATE in YYYY-MM-01 format. Spot assignments use date arrays.

3. **User Permissions**: 
   - Members: View all, edit own data
   - Leaders: Full access to team data
   - Admins: System-wide access including targets

4. **Performance**: Dashboard uses aggregated `sales_records` table for efficiency rather than calculating on-the-fly.

5. **Type Safety**: Database types in `/types/database.ts` must match Supabase schema. Regenerate with `supabase gen types typescript` after schema changes.