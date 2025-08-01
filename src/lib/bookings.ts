import { supabase } from './supabase'
import { Booking, BookingInsert, BookingUpdate, BookingWithPatient, Patient, PatientUpdate, PatientInsert } from './database.types'

export class BookingService {
  // Get all bookings with patient information
  static async getBookings(): Promise<BookingWithPatient[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        patient:patients(*)
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) throw error
    return data as BookingWithPatient[]
  }

  // Get bookings by status
  static async getBookingsByStatus(status: Booking['status']): Promise<BookingWithPatient[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        patient:patients(*)
      `)
      .eq('status', status)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) throw error
    return data as BookingWithPatient[]
  }

  // Get bookings by type
  static async getBookingsByType(type: Booking['booking_type']): Promise<BookingWithPatient[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        patient:patients(*)
      `)
      .eq('booking_type', type)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) throw error
    return data as BookingWithPatient[]
  }

  // Get bookings for current user (patient view)
  static async getMyBookings(): Promise<BookingWithPatient[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        patient:patients(*)
      `)
      .eq('created_by', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) throw error
    return data as BookingWithPatient[]
  }

  // Get current user's patient records (can have multiple)
  static async getMyPatientRecords(): Promise<Patient[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .order('full_name', { ascending: true })

    if (error) throw error
    return data
  }

  // Create a new booking for a specific patient
  static async createBooking(patientId: string, bookingData: Omit<BookingInsert, 'patient_id' | 'created_by'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        patient_id: patientId,
        created_by: user.id
      })
      .select(`
        *,
        patient:patients(*)
      `)
      .single()

    if (error) throw error
    return data as BookingWithPatient
  }

  // Update a booking
  static async updateBooking(id: string, updates: BookingUpdate): Promise<BookingWithPatient> {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patient:patients(*)
      `)
      .single()

    if (error) throw error
    return data as BookingWithPatient
  }

  // Update booking status
  static async updateBookingStatus(id: string, status: Booking['status']) {
    return this.updateBooking(id, { status })
  }

  // Update booking type
  static async updateBookingType(id: string, booking_type: Booking['booking_type']) {
    return this.updateBooking(id, { booking_type })
  }

  // Delete a booking
  static async deleteBooking(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Get booking statistics
  static async getBookingStats() {
    const { data, error } = await supabase
      .from('bookings')
      .select('status, booking_type')

    if (error) throw error

    const stats = {
      total: data.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>
    }

    data.forEach(booking => {
      stats.byStatus[booking.status] = (stats.byStatus[booking.status] || 0) + 1
      stats.byType[booking.booking_type] = (stats.byType[booking.booking_type] || 0) + 1
    })

    return stats
  }
}

export class PatientService {
  // Get current user's patient profiles (can have multiple)
  static async getMyProfiles(): Promise<Patient[]> {
    return BookingService.getMyPatientRecords()
  }

  // Create a new patient record
  static async createPatient(patientData: Omit<PatientInsert, 'user_id'>): Promise<Patient> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...patientData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Create a standalone patient (no user_id)
  static async createStandalonePatient(patientData: PatientInsert): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...patientData,
        user_id: null
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update patient profile
  static async updatePatient(patientId: string, updates: PatientUpdate): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', patientId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete patient
  static async deletePatient(patientId: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId)

    if (error) throw error
  }

  // Get all patients (admin function)
  static async getAllPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) throw error
    return data
  }

  // Get patient by ID
  static async getPatientById(patientId: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No patient found
      throw error
    }
    return data
  }

  // Search patients by name or email
  static async searchPatients(query: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('full_name', { ascending: true })

    if (error) throw error
    return data
  }
} 