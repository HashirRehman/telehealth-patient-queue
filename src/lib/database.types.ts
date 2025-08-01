export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          user_id: string | null
          created_at: string
          updated_at: string
          full_name: string
          email: string
          phone: string | null
          date_of_birth: string | null
          address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
          full_name: string
          email: string
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          patient_id: string
          created_at: string
          updated_at: string
          appointment_date: string
          appointment_time: string
          booking_type: 'pre-booked' | 'online'
          status: 'pending' | 'confirmed' | 'intake' | 'ready-for-provider' | 'provider' | 'ready-for-discharge' | 'discharged' | 'cancelled'
          notes: string | null
          created_by: string
          provider_name: string | null
          chief_complaint: string | null
          room_location: string | null
          is_adhoc: boolean
        }
        Insert: {
          id?: string
          patient_id: string
          created_at?: string
          updated_at?: string
          appointment_date: string
          appointment_time: string
          booking_type?: 'pre-booked' | 'online'
          status?: 'pending' | 'confirmed' | 'intake' | 'ready-for-provider' | 'provider' | 'ready-for-discharge' | 'discharged' | 'cancelled'
          notes?: string | null
          created_by: string
          provider_name?: string | null
          chief_complaint?: string | null
          room_location?: string | null
          is_adhoc?: boolean
        }
        Update: {
          id?: string
          patient_id?: string
          created_at?: string
          updated_at?: string
          appointment_date?: string
          appointment_time?: string
          booking_type?: 'pre-booked' | 'online'
          status?: 'pending' | 'confirmed' | 'intake' | 'ready-for-provider' | 'provider' | 'ready-for-discharge' | 'discharged' | 'cancelled'
          notes?: string | null
          created_by?: string
          provider_name?: string | null
          chief_complaint?: string | null
          room_location?: string | null
          is_adhoc?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_type: 'pre-booked' | 'online'
      booking_status: 'pending' | 'confirmed' | 'intake' | 'ready-for-provider' | 'provider' | 'ready-for-discharge' | 'discharged' | 'cancelled'
    }
  }
}

export type Patient = Database['public']['Tables']['patients']['Row']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type PatientUpdate = Database['public']['Tables']['patients']['Update']

export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']

// Extended types with relationships
export type BookingWithPatient = Booking & {
  patient: Patient
}

export type PatientWithBookings = Patient & {
  bookings: Booking[]
}

// Telehealth Queue specific types
export type TelehealthStatus = 'pending' | 'confirmed' | 'intake' | 'ready-for-provider' | 'provider' | 'ready-for-discharge' | 'discharged' | 'cancelled'

export type QueueTab = 'pre-booked' | 'in-office' | 'completed'

export type QueueFilters = {
  statuses: TelehealthStatus[]
  providerName: string | null
  patientNameSearch: string
} 