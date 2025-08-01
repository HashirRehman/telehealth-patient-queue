import { supabase } from './supabase'

export class DatabaseChecker {
  // Test if we can update a booking with the new status
  static async testIntakeStatusUpdate() {
    try {
      // First, get a booking to test with
      const { data: bookings, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1)

      if (fetchError) {
        console.error('Error fetching bookings:', fetchError)
        return { success: false, error: fetchError.message }
      }

      if (!bookings || bookings.length === 0) {
        return { success: false, error: 'No bookings found to test with' }
      }

      const testBooking = bookings[0]
      console.log('Testing with booking:', testBooking.id)

      // Try to update the booking to intake status
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'intake' })
        .eq('id', testBooking.id)
        .select()
        .single()

      if (error) {
        console.error('Status update failed:', error)
        return { 
          success: false, 
          error: error.message,
          details: error,
          hint: error.hint,
          code: error.code
        }
      }

      console.log('Status update successful:', data)
      
      // Revert the change
      await supabase
        .from('bookings')
        .update({ status: testBooking.status })
        .eq('id', testBooking.id)

      return { success: true, data }
    } catch (err) {
      console.error('Exception during test:', err)
      return { success: false, error: String(err) }
    }
  }

  // Check what enum values are available
  static async checkEnumValues() {
    try {
      // Query the PostgreSQL system tables to get enum values
      const { data, error } = await supabase.rpc('sql', {
        query: `
          SELECT enumlabel 
          FROM pg_enum 
          WHERE enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'booking_status'
          )
          ORDER BY enumsortorder;
        `
      })

      if (error) {
        console.error('Error checking enum values:', error)
        return null
      }

      console.log('Available booking status enum values:', data)
      return data
    } catch (err) {
      console.error('Exception checking enum values:', err)
      return null
    }
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { DatabaseChecker: typeof DatabaseChecker }).DatabaseChecker = DatabaseChecker
} 