# Prisma Migration Guide

This guide explains the transition from manual Supabase migrations to Prisma ORM.

## 🎯 What's Changed

### Before (Manual Supabase)

- Manual SQL migrations in `supabase/migrations/`
- Manual seed data with hardcoded UUIDs
- Complex setup process with multiple options
- No type safety for database operations

### After (Prisma ORM)

- Type-safe database schema in `prisma/schema.prisma`
- Automated migrations with `npm run db:migrate`
- Smart seeding with `npm run db:seed`
- Prisma Client for type-safe database queries

## 🚀 Quick Start (New Setup)

1. **Install dependencies:**

   ```bash
   ./scripts/install-deps.sh
   # OR manually: yarn add prisma @prisma/client bcryptjs @types/bcryptjs tsx
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials:
   # - NEXT_PUBLIC_SUPABASE_URL
   # - NEXT_PUBLIC_SUPABASE_ANON_KEY
   # - SUPABASE_SERVICE_ROLE_KEY (for seeding)
   # - DATABASE_URL
   ```

3. **Initialize database:**

   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:migrate   # Push schema to database
   npm run db:seed      # Add sample data
   ```

4. **Verify setup:**
   ```bash
   npm run db:studio    # Open database GUI
   ```

## 📂 New Files Created

```
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts               # Seed script with sample data
├── src/lib/
│   └── prisma.ts             # Prisma client configuration
├── scripts/
│   └── install-deps.sh       # Dependency installation script
└── PRISMA_MIGRATION_GUIDE.md # This guide
```

## 🔧 Available Commands

| Command               | Description                                 |
| --------------------- | ------------------------------------------- |
| `npm run db:generate` | Generate Prisma client from schema          |
| `npm run db:migrate`  | Push schema changes to database             |
| `npm run db:seed`     | Seed database with test data                |
| `npm run db:studio`   | Open Prisma Studio (database GUI)           |
| `npm run db:reset`    | Reset database and reseed (⚠️ deletes data) |

## 👥 Test User Credentials

After seeding, use these credentials for testing:

| Role         | Email                      | Password      |
| ------------ | -------------------------- | ------------- |
| **Admin**    | `admin@telehealth.com`     | `admin123`    |
| **Provider** | `provider@telehealth.com`  | `provider123` |
| **Patient**  | `john.doe@email.com`       | `patient123`  |
| **Patient**  | `jane.smith@email.com`     | `patient123`  |
| **Patient**  | `robert.johnson@email.com` | `patient123`  |

> **Note:** These users are automatically created in Supabase Auth with proper user_id links to patient records!

## 🔄 Migrating Existing Projects

If you have an existing database:

1. **Backup your data** (important!)
2. Run the new Prisma setup
3. The schema matches your existing structure, so no data loss should occur
4. Run `npm run db:seed` to add test users

## 🛠️ Troubleshooting

### Common Issues

1. **Missing dependencies:**

   ```bash
   yarn install
   # or run: ./scripts/install-deps.sh
   ```

2. **Wrong DATABASE_URL:**

   ```bash
   # Check your .env.local file
   # Format: postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
   ```

3. **Connection errors:**
   - Verify Supabase project is not paused
   - Check password in DATABASE_URL
   - Ensure Supabase project is active

4. **Schema conflicts:**
   ```bash
   npm run db:reset  # ⚠️ This deletes all data
   ```

## 📚 Using Prisma in Your Code

### Before (Supabase client)

```typescript
import { supabase } from '@/lib/supabase'

const { data } = await supabase.from('patients').select('*')
```

### After (Prisma client)

```typescript
import { prisma } from '@/lib/prisma'

const patients = await prisma.patient.findMany({
  include: { bookings: true },
})
```

## 🎉 Benefits

- **Type Safety**: Full TypeScript support with auto-completion
- **Easier Migrations**: Simple schema changes with automatic migrations
- **Better DX**: Prisma Studio for database browsing
- **Consistent Seeding**: Reliable test data generation
- **Simpler Setup**: One-command database initialization

## 📖 Next Steps

1. Update existing database queries to use Prisma client
2. Explore Prisma Studio for database management
3. Use `npm run db:seed` for consistent test data
4. Consider using Prisma relations for complex queries

For detailed documentation, see the updated README.md file.
