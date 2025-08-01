-- Seed data for hospital management system

INSERT INTO patients (id, user_id, full_name, email, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone) VALUES
('c954cb14-2d23-40c9-b506-5cd99964f20e', 'f1b37679-3b51-4a53-b0cd-86cdf361b488', 'John Smith', 'john.smith@email.com', '+1-555-0101', '1985-03-15', '123 Main St, City, State 12345', 'Jane Smith', '+1-555-0102')

INSERT INTO bookings (patient_id, appointment_date, appointment_time, booking_type, status, notes, created_by) VALUES
('c954cb14-2d23-40c9-b506-5cd99964f20e', '2024-01-15', '09:00:00', 'pre-booked', 'confirmed', 'Regular checkup appointment', 'f1b37679-3b51-4a53-b0cd-86cdf361b488'),
('c954cb14-2d23-40c9-b506-5cd99964f20e', '2024-01-22', '14:30:00', 'online', 'waiting-room', 'Follow-up consultation', 'f1b37679-3b51-4a53-b0cd-86cdf361b488'),
('c954cb14-2d23-40c9-b506-5cd99964f20e', '2024-01-16', '10:15:00', 'pre-booked', 'pending', 'Initial consultation', 'f1b37679-3b51-4a53-b0cd-86cdf361b488'),
('c954cb14-2d23-40c9-b506-5cd99964f20e', '2024-01-25', '11:00:00', 'online', 'in-call', 'Urgent care consultation', 'f1b37679-3b51-4a53-b0cd-86cdf361b488'),

('c954cb14-2d23-40c9-b506-5cd99964f20e', '2024-01-17', '15:45:00', 'online', 'completed', 'Medication review', 'f1b37679-3b51-4a53-b0cd-86cdf361b488'),
('c954cb14-2d23-40c9-b506-5cd99964f20e', '2024-01-30', '08:30:00', 'pre-booked', 'confirmed', 'Lab results discussion', 'f1b37679-3b51-4a53-b0cd-86cdf361b488'),

('c954cb14-2d23-40c9-b506-5cd99964f20e', '2024-01-18', '13:20:00', 'online', 'pending', 'Telemedicine consultation', 'f1b37679-3b51-4a53-b0cd-86cdf361b488'),
('c954cb14-2d23-40c9-b506-5cd99964f20e', '2024-02-01', '16:00:00', 'pre-booked', 'cancelled', 'Cancelled due to schedule conflict', 'f1b37679-3b51-4a53-b0cd-86cdf361b488'),

-- Instructions for using this seed file:
-- 1. Replace the patient UUIDs ('c954cb14-2d23-40c9-b506-5cd99964f20e', 'c954cb14-2d23-40c9-b506-5cd99964f20g', etc.) with actual UUIDs
-- 2. Replace the user UUIDs with actual user IDs from your auth.users table
-- 3. For patients without user_id, set to NULL or remove those patients
-- 4. For bookings, created_by must be a valid user ID from auth.users
-- 5. You can have multiple patients per user_id (one user can manage multiple patients)
-- 6. Some patients can exist without being linked to any user (user_id = NULL)

-- Example scenarios:
-- - User A manages Patient 1 and Patient 2 (both have user_id = User A's ID)
-- - Patient 5 is a walk-in patient with no user account (user_id = NULL)
-- - Admin user creates bookings for any patient regardless of user_id relationship
