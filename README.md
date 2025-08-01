# Telehealth Patient Queue Management System

A comprehensive telehealth platform built with Next.js, featuring real-time patient queue management, video consultations, and role-based access control for healthcare providers.

## Features

- 🔐 **Authentication**: Secure login and signup with Supabase Auth
- 👥 **Role-based Access**: Admin, Provider, and Patient roles
- 🏥 **Telehealth Queue Management**: Real-time patient queue with status tracking
- 📋 **Patient Management**: Comprehensive patient profiles and booking history
- 📅 **Appointment Booking**: Online and pre-booked appointment scheduling
- 🎥 **Video Call Integration**: Built-in video consultation interface
- ⏰ **Waiting Room**: Patient waiting room with real-time updates
- 📊 **Admin Dashboard**: Provider management and queue overview
- 📱 **Responsive Design**: Modern UI with shadcn/ui components
- 🔒 **Protected Routes**: Secure access to sensitive pages

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (Authentication, Database)
- **Database ORM**: Prisma
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
git clone https://github.com/HashirRehman/telehealth-patient-queue.git
cd telehealth-patient-queue
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   - Update your Supabase credentials in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres"
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
2. Go to Settings > API to find your:
   - **Project URL** and **anon key** (for frontend)
   - **service_role key** (for seeding - keep this secret!)
3. Go to Settings > Database to find your **DATABASE_URL** (Connection string > URI)
4. Add all these credentials to your `.env.local` file
5. Enable email authentication in Authentication > Settings
6. Configure email templates if needed

### Database Setup with Prisma

We use **Prisma ORM** for database management, which provides type-safe database access and easy migrations.

#### Quick Setup (Recommended)

1. **Install dependencies**:

   ```bash
   yarn install
   # or
   npm install
   ```

2. **Set up your database**:

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to your Supabase database
   npm run db:migrate

   # Seed the database with test data
   npm run db:seed
   ```

3. **That's it!** Your database is ready with sample data.

#### Available Database Commands

```bash
# Generate Prisma client (run after schema changes)
npm run db:generate

# Push schema changes to database (like migrations)
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database and reseed (⚠️ deletes all data)
npm run db:reset
```

#### Alternative Setup Options

If you prefer manual setup or encounter issues:

**Option A: Using Supabase CLI**

```bash
supabase init
supabase login
supabase link --project-ref your-project-ref
npm run db:migrate  # Uses Prisma instead of Supabase migrations
npm run db:seed
```

**Option B: Manual SQL (Legacy)**
If you still want to use the old SQL migration files:

1. Go to SQL Editor in your Supabase dashboard
2. Run `supabase/migrations/20240101000000_initial_schema.sql`
3. Run `supabase/migrations/20241201000000_telehealth_queue_updates.sql`
4. Then run `npm run db:seed` for test data

### Verify Database Setup

After running the setup commands:

1. **Check Tables**: Go to Database → Tables and verify `patients` and `bookings` tables exist
2. **View Sample Data**: Use `npm run db:studio` to open Prisma Studio and browse your data
3. **Test the App**: Run `yarn dev` and try logging in with test credentials

### Test User Credentials

After seeding, you can use these credentials to test the application:

| Role         | Email                      | Password      | Description           |
| ------------ | -------------------------- | ------------- | --------------------- |
| **Admin**    | `admin@telehealth.com`     | `admin123`    | Administrator account |
| **Provider** | `provider@telehealth.com`  | `provider123` | Healthcare provider   |
| **Patient**  | `john.doe@email.com`       | `patient123`  | Test patient 1        |
| **Patient**  | `jane.smith@email.com`     | `patient123`  | Test patient 2        |
| **Patient**  | `robert.johnson@email.com` | `patient123`  | Test patient 3        |

**Note**: These users are automatically created in Supabase Auth during seeding, so you can log in immediately with these credentials!

### Troubleshooting

**If database setup fails:**

```bash
# First, check your environment setup
npm run db:check-env

# Check your DATABASE_URL in .env.local
echo $DATABASE_URL

# Reset everything and start fresh (⚠️ This deletes all data!)
npm run db:reset

# Or step by step:
npm run db:generate
npm run db:migrate
npm run db:seed
```

**Common issues:**

1. **"User not allowed" error during seeding:**
   - ❌ Missing `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
   - ✅ Get it from: Supabase Dashboard → Settings → API → service_role key
   - ✅ Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`

2. **Other issues:**
   - **Wrong DATABASE_URL**: Make sure it matches your Supabase project
   - **Permission errors**: Verify your Supabase password is correct
   - **Connection timeout**: Check if your Supabase project is paused (free tier)
   - **Missing dependencies**: Run `yarn install` or `npm install`

### Database Schema

The Prisma schema (`prisma/schema.prisma`) creates:

**Patients Table**:

- ✅ Patient demographics and contact information
- ✅ Emergency contact details
- ✅ Links to Supabase auth users

**Bookings Table**:

- ✅ Appointment scheduling with date/time
- ✅ Booking types: `pre_booked`, `online`
- ✅ Comprehensive status tracking: `pending`, `confirmed`, `intake`, `ready_for_provider`, `provider`, `ready_for_discharge`, `discharged`, `completed`, `cancelled`
- ✅ Provider assignment and room management
- ✅ Chief complaints and notes
- ✅ Ad-hoc appointment support

**Sample Data**:

- ✅ 5 test patients with realistic information
- ✅ 15+ sample bookings with various statuses
- ✅ Multiple providers and room locations
- ✅ Mix of appointment types and time slots

## Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── admin/                   # Admin dashboard page
│   ├── auth/callback/           # Auth callback handler
│   ├── dashboard/               # Protected dashboard page
│   ├── forgot-password/         # Password reset page
│   ├── login/                   # Login page
│   ├── patient-portal/          # Patient portal dashboard
│   ├── reset-password/          # Password reset form
│   ├── signup/                  # User registration page
│   ├── telehealth-queue/        # Main queue management interface
│   ├── video-call/[bookingId]/  # Video consultation room
│   ├── waiting-room/[bookingId]/ # Patient waiting room
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Home page
├── components/
│   ├── admin/                   # Admin-specific components
│   │   ├── BookingCard.tsx
│   │   ├── CreateBookingForm.tsx
│   │   └── EnhancedCreateBookingForm.tsx
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── common/                  # Shared components
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── StatusBadge.tsx
│   ├── patient/                 # Patient-specific components
│   │   ├── PatientDetailsModal.tsx
│   │   └── PatientTelehealthCard.tsx
│   ├── telehealth/              # Telehealth queue components
│   │   ├── NotificationSystem.tsx
│   │   ├── QueueStatusBadge.tsx
│   │   └── QueueStatusFlow.tsx
│   └── ui/                      # shadcn/ui components
├── contexts/
│   ├── AuthContext.tsx          # Authentication context
│   └── DataContext.tsx          # Data management context
├── hooks/                       # Custom React hooks
│   ├── useBookings.ts
│   ├── useOptimizedBookings.ts
│   ├── usePatients.ts
│   └── useRealtimeQueue.ts
└── lib/
    ├── constants/               # App constants
    │   └── status.ts
    ├── utils/                   # Utility functions
    │   ├── booking.ts
    │   ├── date.ts
    │   └── index.ts
    ├── bookings.ts              # Booking service
    ├── database.types.ts        # TypeScript types
    ├── prisma.ts                # Prisma client
    ├── queue.ts                 # Queue management
    ├── supabase.ts              # Supabase client
    └── utils.ts                 # General utilities
```

## Application Flow

### Authentication Flow
1. **Sign Up**: Users can create an account with email/password
2. **Email Verification**: Supabase sends verification email
3. **Sign In**: Users can log in with verified credentials
4. **Role-based Routing**: Different dashboards based on user role (Admin/Provider/Patient)
5. **Sign Out**: Users can securely log out

### Telehealth Queue Flow
1. **Booking Creation**: Patients book appointments online or providers create bookings
2. **Queue Management**: Real-time queue with status tracking (pending → confirmed → intake → ready for provider → provider → discharge → completed)
3. **Patient Check-in**: Patients can check into the waiting room
4. **Provider Workflow**: Providers can move patients through different statuses
5. **Video Consultation**: Integrated video call interface for telehealth appointments
6. **Appointment Completion**: Final status updates and discharge process

## Available Scripts

### Development

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

### Database Management

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Push schema to database
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset and reseed database (⚠️ deletes data)
- `npm run db:check-env` - Verify environment setup
