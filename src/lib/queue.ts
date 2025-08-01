import { BookingService } from './bookings'
import type { BookingUpdate } from './database.types'

export class QueueService {
  /**
   * Move a patient to intake status
   */
  static async moveToIntake(bookingId: string): Promise<void> {
    const updates: BookingUpdate = {
      status: 'intake',
      updated_at: new Date().toISOString()
    }
    
    await BookingService.updateBooking(bookingId, updates)
  }

  /**
   * Move a patient to ready-for-provider status
   */
  static async moveToReadyForProvider(bookingId: string): Promise<void> {
    const updates: BookingUpdate = {
      status: 'ready-for-provider',
      updated_at: new Date().toISOString()
    }
    
    await BookingService.updateBooking(bookingId, updates)
  }

  /**
   * Start a video call for a patient (move to provider status)
   */
  static async startCall(bookingId: string): Promise<void> {
    const updates: BookingUpdate = {
      status: 'provider',
      updated_at: new Date().toISOString()
    }
    
    await BookingService.updateBooking(bookingId, updates)
  }

  /**
   * Complete a video call (move to ready-for-discharge)
   */
  static async completeCall(bookingId: string): Promise<void> {
    const updates: BookingUpdate = {
      status: 'ready-for-discharge',
      updated_at: new Date().toISOString()
    }
    
    await BookingService.updateBooking(bookingId, updates)
  }

  /**
   * Discharge a patient
   */
  static async dischargePatient(bookingId: string): Promise<void> {
    const updates: BookingUpdate = {
      status: 'discharged',
      updated_at: new Date().toISOString()
    }
    
    await BookingService.updateBooking(bookingId, updates)
  }

  /**
   * Remove a patient from queue (back to confirmed)
   */
  static async removeFromQueue(bookingId: string): Promise<void> {
    const updates: BookingUpdate = {
      status: 'confirmed',
      updated_at: new Date().toISOString()
    }
    
    await BookingService.updateBooking(bookingId, updates)
  }

  /**
   * Cancel an appointment
   */
  static async cancelAppointment(bookingId: string): Promise<void> {
    const updates: BookingUpdate = {
      status: 'cancelled',
      updated_at: new Date().toISOString()
    }
    
    await BookingService.updateBooking(bookingId, updates)
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats() {
    const bookings = await BookingService.getBookings()
    
    // Filter only online bookings for telehealth queue
    const telehealthBookings = bookings.filter(b => b.booking_type === 'online')
    
    const stats = {
      total: telehealthBookings.length,
      pending: telehealthBookings.filter(b => b.status === 'pending').length,
      confirmed: telehealthBookings.filter(b => b.status === 'confirmed').length,
      intake: telehealthBookings.filter(b => b.status === 'intake').length,
      readyForProvider: telehealthBookings.filter(b => b.status === 'ready-for-provider').length,
      provider: telehealthBookings.filter(b => b.status === 'provider').length,
      readyForDischarge: telehealthBookings.filter(b => b.status === 'ready-for-discharge').length,
      discharged: telehealthBookings.filter(b => b.status === 'discharged').length,
      cancelled: telehealthBookings.filter(b => b.status === 'cancelled').length
    }

    return stats
  }

  /**
   * Get current queue by status groups
   */
  static async getQueueByStatus() {
    const bookings = await BookingService.getBookings()
    
    // Filter only online bookings for telehealth queue
    const telehealthBookings = bookings.filter(
      b => b.booking_type === 'online' && 
      ['confirmed', 'intake', 'ready-for-provider', 'provider'].includes(b.status)
    )

    return {
      confirmed: telehealthBookings.filter(b => b.status === 'confirmed'),
      intake: telehealthBookings.filter(b => b.status === 'intake'),
      readyForProvider: telehealthBookings.filter(b => b.status === 'ready-for-provider'),
      provider: telehealthBookings.filter(b => b.status === 'provider')
    }
  }

  /**
   * Get next patient ready for provider (oldest ready-for-provider appointment)
   */
  static async getNextPatient() {
    const bookings = await BookingService.getBookings()
    
    const readyBookings = bookings
      .filter(b => b.booking_type === 'online' && b.status === 'ready-for-provider')
      .sort((a, b) => {
        // Sort by appointment date and time
        const aDateTime = new Date(`${a.appointment_date}T${a.appointment_time}`)
        const bDateTime = new Date(`${b.appointment_date}T${b.appointment_time}`)
        return aDateTime.getTime() - bDateTime.getTime()
      })

    return readyBookings[0] || null
  }

  /**
   * Auto-advance queue (move next confirmed patient to intake if none are in intake)
   */
  static async autoAdvanceQueue(): Promise<boolean> {
    const { intake } = await this.getQueueByStatus()
    
    // If no one is in intake, move next confirmed patient
    if (intake.length === 0) {
      const bookings = await BookingService.getBookings()
      const nextConfirmed = bookings
        .filter(b => b.booking_type === 'online' && b.status === 'confirmed')
        .sort((a, b) => {
          const aDateTime = new Date(`${a.appointment_date}T${a.appointment_time}`)
          const bDateTime = new Date(`${b.appointment_date}T${b.appointment_time}`)
          return aDateTime.getTime() - bDateTime.getTime()
        })[0]
      
      if (nextConfirmed) {
        await this.moveToIntake(nextConfirmed.id)
        return true
      }
    }
    
    return false
  }

  /**
   * Get estimated wait time for a patient (in minutes)
   */
  static async getEstimatedWaitTime(bookingId: string): Promise<number> {
    const bookings = await BookingService.getBookings()
    const targetBooking = bookings.find(b => b.id === bookingId)
    
    if (!targetBooking) return 0
    
    // If already with provider, return 0
    if (targetBooking.status === 'provider') {
      return 0
    }

    const { intake, readyForProvider, provider } = await this.getQueueByStatus()
    
    // Estimate based on queue position:
    // - 15 minutes per active call
    // - 10 minutes per patient ready for provider
    // - 5 minutes per patient in intake
    const activeCallTime = provider.length * 15
    const readyTime = readyForProvider.length * 10
    const intakeTime = intake.length * 5
    
    return activeCallTime + readyTime + intakeTime
  }
} 