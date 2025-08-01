# Hospital Management System

A comprehensive hospital management system built with Next.js, Supabase, and Tailwind CSS featuring telehealth queue management, patient booking, and video consultations.

## Features

- 🔐 **Authentication**: Secure login and signup with Supabase Auth
- 👥 **User Management**: Role-based access control
- 🏥 **Dashboard**: Overview of hospital operations
- 📱 **Responsive Design**: Modern UI with shadcn/ui components
- 🔒 **Protected Routes**: Secure access to sensitive pages

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (Authentication, Database)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
https://github.com/HashirRehman/telehealth-patient-queue.git
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run the development server:
```bash
yarn dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Add these to your `.env.local` file
4. Enable email authentication in Authentication > Settings
5. Configure email templates if needed

### Database Migration Setup

Once you have your Supabase project ready, you need to set up the database schema. You have **three options**:

#### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (replace `your-project-ref` with your actual project reference):
   ```bash
   supabase link --project-ref your-project-ref
   ```
   
   💡 **Find your project reference**: Go to your Supabase project dashboard, it's in the URL: `supabase.com/dashboard/project/[PROJECT-REF]`

4. **Push migrations to your cloud database**:
   ```bash
   supabase db push
   ```

5. **Verify migrations were applied**:
   ```bash
   supabase db diff --linked
   ```

#### Option B: Manual SQL Execution (Copy & Paste)

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of each migration file in order:

   **Step 1**: Copy and run `supabase/migrations/20240101000000_initial_schema.sql`
   
   **Step 2**: Copy and run `supabase/migrations/20241201000000_telehealth_queue_updates.sql`

3. Click "Run" for each SQL script

#### Option C: Using Database URL (Advanced)

1. Get your **database URL** from: Settings → Database → Connection string → URI
2. Run migrations using psql:
   ```bash
   # Install PostgreSQL client if needed
   # macOS: brew install postgresql
   # Ubuntu: sudo apt install postgresql-client
   
   # Run migrations in order
   psql "your-database-url" -f supabase/migrations/20240101000000_initial_schema.sql
   psql "your-database-url" -f supabase/migrations/20241201000000_telehealth_queue_updates.sql
   ```

### Verify Database Setup

After running migrations:

1. **Check Tables**: Go to Database → Tables and verify `patients` and `bookings` tables exist
2. **Check Enums**: The `booking_status` enum should include: `pending`, `confirmed`, `intake`, `ready-for-provider`, `provider`, `ready-for-discharge`, `discharged`, `cancelled`
3. **Test the App**: Run `yarn dev` and try creating a booking to ensure everything works

### Migration Troubleshooting

**If migrations fail:**
```bash
# Check what went wrong
supabase db diff --linked

# Reset and try again (⚠️ This deletes all data!)
supabase db reset --linked
supabase db push
```

**Common issues:**
- Make sure you're linked to the correct project
- Verify you have proper permissions on your Supabase project
- Run migrations in the correct order (initial schema first, then updates)

### What Do These Migrations Create?

**Migration 1 - Initial Schema** (`20240101000000_initial_schema.sql`):
- ✅ Creates `patients` table with user info, contact details, emergency contacts
- ✅ Creates `bookings` table with appointment scheduling
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates basic `booking_status` enum: `pending`, `confirmed`, `waiting-room`, `in-call`, `completed`, `cancelled`

**Migration 2 - Telehealth Updates** (`20241201000000_telehealth_queue_updates.sql`):
- ✅ Adds new telehealth statuses: `intake`, `ready-for-provider`, `provider`, `ready-for-discharge`, `discharged`
- ✅ Adds `provider_name`, `chief_complaint`, `room_location`, `is_adhoc` columns to bookings
- ✅ Creates database indexes for better performance
- ✅ Adds helpful column comments

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Protected dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── layout.tsx        # Root layout with AuthProvider
│   └── page.tsx          # Home page
├── components/
│   ├── auth/             # Authentication components
│   └── ui/               # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx   # Authentication context
└── lib/
    ├── supabase.ts       # Supabase client configuration
    └── utils.ts          # Utility functions
```

## Authentication Flow

1. **Sign Up**: Users can create an account with email/password
2. **Email Verification**: Supabase sends verification email
3. **Sign In**: Users can log in with verified credentials
4. **Protected Routes**: Dashboard requires authentication
5. **Sign Out**: Users can securely log out

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

