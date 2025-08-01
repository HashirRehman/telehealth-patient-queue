-- Update booking_status enum to include new telehealth queue statuses
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'intake';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'ready-for-provider';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'provider';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'ready-for-discharge';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'discharged';

-- Add new columns to bookings table for telehealth queue functionality
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS chief_complaint TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_location TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_adhoc BOOLEAN DEFAULT FALSE;

-- Update existing bookings to set is_adhoc based on some logic
-- For now, we'll set all existing bookings as not adhoc
UPDATE bookings SET is_adhoc = FALSE WHERE is_adhoc IS NULL;

-- Create index for performance on provider_name and room_location
CREATE INDEX IF NOT EXISTS idx_bookings_provider_name ON bookings(provider_name);
CREATE INDEX IF NOT EXISTS idx_bookings_room_location ON bookings(room_location);
CREATE INDEX IF NOT EXISTS idx_bookings_is_adhoc ON bookings(is_adhoc);

-- Add comment explaining the new columns
COMMENT ON COLUMN bookings.provider_name IS 'Name of the healthcare provider assigned to this booking';
COMMENT ON COLUMN bookings.chief_complaint IS 'Primary reason or complaint for the patient visit';
COMMENT ON COLUMN bookings.room_location IS 'Physical or virtual room location for the appointment';
COMMENT ON COLUMN bookings.is_adhoc IS 'Whether this is an ad-hoc appointment or scheduled appointment'; 