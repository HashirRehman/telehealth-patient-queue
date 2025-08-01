-- Seed data for hospital management system

INSERT INTO patients (id, user_id, full_name, email, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone) VALUES
('patient-id-1', 'user-id-1', 'John Smith', 'john.smith@email.com', '+1-555-0101', '1985-03-15', '123 Main St, City, State 12345', 'Jane Smith', '+1-555-0102'),
('patient-id-2', 'user-id-2', 'Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0201', '1990-07-22', '456 Oak Ave, City, State 12345', 'Mike Johnson', '+1-555-0202'),
('patient-id-3', 'user-id-3', 'Michael Brown', 'michael.brown@email.com', '+1-555-0301', '1988-11-08', '789 Pine Rd, City, State 12345', 'Lisa Brown', '+1-555-0302'),
('patient-id-4', 'user-id-4', 'Emily Davis', 'emily.davis@email.com', '+1-555-0401', '1992-05-18', '321 Elm St, City, State 12345', 'Robert Davis', '+1-555-0402'),
('patient-id-5', NULL, 'David Wilson', 'david.wilson@email.com', '+1-555-0501', '1987-09-30', '654 Maple Dr, City, State 12345', 'Carol Wilson', '+1-555-0502');

INSERT INTO bookings (patient_id, appointment_date, appointment_time, booking_type, status, notes, created_by) VALUES
('patient-id-1', '2024-01-15', '09:00:00', 'pre-booked', 'confirmed', 'Regular checkup appointment', 'user-id-1'),
('patient-id-1', '2024-01-22', '14:30:00', 'online', 'waiting-room', 'Follow-up consultation', 'user-id-1'),
('patient-id-2', '2024-01-16', '10:15:00', 'pre-booked', 'pending', 'Initial consultation', 'user-id-2'),
('patient-id-2', '2024-01-25', '11:00:00', 'online', 'in-call', 'Urgent care consultation', 'user-id-2'),

('patient-id-3', '2024-01-17', '15:45:00', 'online', 'completed', 'Medication review', 'user-id-3'),
('patient-id-3', '2024-01-30', '08:30:00', 'pre-booked', 'confirmed', 'Lab results discussion', 'user-id-3'),

('patient-id-4', '2024-01-18', '13:20:00', 'online', 'pending', 'Telemedicine consultation', 'user-id-4'),
('patient-id-4', '2024-02-01', '16:00:00', 'pre-booked', 'cancelled', 'Cancelled due to schedule conflict', 'user-id-4'),

('patient-id-5', '2024-01-19', '12:00:00', 'online', 'waiting-room', 'General health consultation', 'user-id-admin'),
('patient-id-5', '2024-02-05', '10:45:00', 'pre-booked', 'confirmed', 'Physical therapy follow-up', 'user-id-admin');

-- Instructions for using this seed file:
-- 1. Replace the patient UUIDs ('patient-id-1', 'patient-id-2', etc.) with actual UUIDs
-- 2. Replace the user UUIDs with actual user IDs from your auth.users table
-- 3. For patients without user_id, set to NULL or remove those patients
-- 4. For bookings, created_by must be a valid user ID from auth.users
-- 5. You can have multiple patients per user_id (one user can manage multiple patients)
-- 6. Some patients can exist without being linked to any user (user_id = NULL)

-- Example scenarios:
-- - User A manages Patient 1 and Patient 2 (both have user_id = User A's ID)
-- - Patient 5 is a walk-in patient with no user account (user_id = NULL)
-- - Admin user creates bookings for any patient regardless of user_id relationship 