import { supabase } from './supabase'

export class BookingStatusDebug {
  // Test if a specific status value is valid in the database
  static async testStatusUpdate(bookingId: string, status: string) {
    console.log(`Testing status update: ${bookingId} -> ${status}`)
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) {
        console.error('Status update failed:', error)
        return { success: false, error: error.message }
      }

      console.log('Status update successful:', data)
      return { success: true, data }
    } catch (err) {
      console.error('Exception during status update:', err)
      return { success: false, error: err }
    }
  }

  // Get current database enum values for booking_status
  static async getValidStatuses() {
    try {
      const { data, error } = await supabase.rpc('get_enum_values', {
        enum_name: 'booking_status'
      })

      if (error) {
        console.error('Failed to get enum values:', error)
        return null
      }

      console.log('Valid booking statuses:', data)
      return data
    } catch (err) {
      console.error('Exception getting enum values:', err)
      return null
    }
  }

  // Check current booking data
  static async getBookingDetails(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (error) {
        console.error('Failed to get booking:', error)
        return null
      }

      console.log('Current booking details:', data)
      return data
    } catch (err) {
      console.error('Exception getting booking:', err)
      return null
    }
  }
}

// Add to window for browser console debugging
if (typeof window !== 'undefined') {
  (window as unknown as { BookingStatusDebug: typeof BookingStatusDebug }).BookingStatusDebug = BookingStatusDebug
} 