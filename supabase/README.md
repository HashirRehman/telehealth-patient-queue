# Supabase Database Setup

This directory contains the database migration and seed files for the Hospital Management System.

## Files

- `migrations/20240101000000_initial_schema.sql` - Initial database schema
- `seed.sql` - Sample data for testing (includes 5 patients and 10 bookings)

## Setup Instructions

### 1. Run the Migration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **+ New query**
5. Copy the contents of `migrations/20240101000000_initial_schema.sql`
6. Paste into the SQL editor
7. Click **Run** to execute

This will create:

- `booking_type` enum (pre-booked, online)
- `booking_status` enum (pending, confirmed, waiting-room, in-call, completed, cancelled)
- `patients` table with optional user relationship
- `bookings` table with patient relationship
- Proper RLS policies
- Automatic patient creation trigger (still works for new signups)
- Necessary triggers for automatic timestamps

### 2. Update Seed File with IDs

1. **Generate UUIDs**: Use an online UUID generator or run `SELECT gen_random_uuid();` in Supabase SQL Editor to get UUIDs
2. **Replace Patient IDs**: Open `seed.sql` and replace all `'patient-id-1'`, `'patient-id-2'`, etc. with actual UUIDs
3. **Replace User IDs**:
   - If you have existing users: Replace `'user-id-1'`, `'user-id-2'`, etc. with actual user UUIDs from Authentication > Users
   - If no users: Set user_id to `NULL` for standalone patients
   - For `'user-id-admin'`: Use any existing user ID or create an admin user first

### 3. Run the Seed Data

1. Go back to **SQL Editor**
2. Click **+ New query**
3. Copy the updated contents of `seed.sql`
4. Paste into the SQL editor
5. Click **Run** to execute

This will create:

- **5 patients** with complete profile information
- **10 bookings** (2 per patient) with various statuses and types

## Database Schema

### Patients Table

| Column                  | Type            | Description                          |
| ----------------------- | --------------- | ------------------------------------ |
| id                      | UUID            | Primary key                          |
| user_id                 | UUID (nullable) | Foreign key to auth.users (optional) |
| created_at              | TIMESTAMP       | Auto-generated creation time         |
| updated_at              | TIMESTAMP       | Auto-updated modification time       |
| full_name               | TEXT            | Patient's full name                  |
| email                   | TEXT            | Patient's email address              |
| phone                   | TEXT            | Patient's phone (optional)           |
| date_of_birth           | DATE            | Patient's date of birth (optional)   |
| address                 | TEXT            | Patient's address (optional)         |
| emergency_contact_name  | TEXT            | Emergency contact name (optional)    |
| emergency_contact_phone | TEXT            | Emergency contact phone (optional)   |

### Bookings Table

| Column           | Type      | Description                    |
| ---------------- | --------- | ------------------------------ |
| id               | UUID      | Primary key                    |
| patient_id       | UUID      | Foreign key to patients table  |
| created_at       | TIMESTAMP | Auto-generated creation time   |
| updated_at       | TIMESTAMP | Auto-updated modification time |
| appointment_date | DATE      | Date of appointment            |
| appointment_time | TIME      | Time of appointment            |
| booking_type     | ENUM      | 'pre-booked' or 'online'       |
| status           | ENUM      | Booking status                 |
| notes            | TEXT      | Additional notes (optional)    |
| created_by       | UUID      | Reference to auth.users        |

### Relationships

- **users** (1) → **patients** (many): One user can manage multiple patients
- **patients** (1) → **bookings** (many): One patient can have many bookings
- **users** (1) → **bookings** (many): One user can create many bookings
- **patients** can exist without users (user_id = NULL)

### Row Level Security (RLS)

**Patients Table:**

- Users can view/update their own patient records (where user_id matches)
- All authenticated users can view all patients (for admin functionality)
- Users can create new patient records
- Authenticated users can delete patient records

**Bookings Table:**

- Users can create bookings for any patient
- All authenticated users can view/update/delete all bookings (for admin functionality)

### Patient Management Scenarios

1. **User with Multiple Patients**:
   - User A can manage Patient 1 and Patient 2 (both have user_id = User A's ID)
   - Useful for family members or caregivers

2. **Standalone Patients**:
   - Patient 5 is a walk-in patient with no user account (user_id = NULL)
   - Can be managed by any authenticated user

3. **Admin Management**:
   - Admin users can create bookings for any patient regardless of user_id relationship
   - Admin can manage standalone patients

## User Roles

In this system:

- **Patients**: Regular users who can manage their own patient records and bookings
- **Family/Caregivers**: Users who can manage multiple patient records
- **Admins**: Users with access to the admin panel at `/admin` who can manage all patients and bookings

Admin access is controlled at the application level, not the database level.

## Verification

After setup, you should see:

1. 5 patients in Table Editor > patients (with sample data)
2. 10 bookings in Table Editor > bookings
3. Proper RLS policies applied
4. Your application should work with login/signup and admin panel
5. Users can create multiple patient records
6. Admin panel shows all patients and bookings

## Key Benefits of This Structure

- **Flexible Patient Management**: One user can manage multiple patients (family members, etc.)
- **Standalone Patients**: Support for walk-in patients without user accounts
- **Normalized Data**: Patient info stored once, referenced by bookings
- **Data Integrity**: Foreign key constraints ensure data consistency
- **Automatic Setup**: Patient records still created automatically on signup
- **Scalable**: Easy to add more patient fields without affecting bookings
- **Secure**: Proper RLS ensures appropriate data access control
