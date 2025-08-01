import type { BookingWithPatient, TelehealthStatus } from '@/lib/database.types'

export const getBookingTypeConfig = (type: string) => {
  const configs = {
    online: {
      label: 'Telehealth',
      icon: '📱',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    'pre-booked': {
      label: 'In-Person',
      icon: '🏥',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }
  return configs[type as keyof typeof configs] || configs.online
}

export const formatAppointmentType = (booking: BookingWithPatient): string => {
  if (booking.is_adhoc) {
    return 'Adhoc'
  }
  const time = new Date(`1970-01-01T${booking.appointment_time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  return `Booked ${time}`
}

export const getTabBookings = (bookings: BookingWithPatient[], tab: string) => {
  switch (tab) {
    case 'pre-booked':
      return bookings.filter(b => 
        b.booking_type === 'online' && 
        !['intake', 'ready-for-provider', 'provider', 'ready-for-discharge', 'discharged'].includes(b.status)
      )
    case 'in-office':
      return bookings.filter(b => 
        b.booking_type === 'online' && 
        ['intake', 'ready-for-provider', 'provider'].includes(b.status)
      )
    case 'completed':
      return bookings.filter(b => 
        b.booking_type === 'online' && 
        ['ready-for-discharge', 'discharged'].includes(b.status)
      )
    default:
      return []
  }
}

export const filterBookings = (
  bookings: BookingWithPatient[], 
  filters: {
    statuses: TelehealthStatus[]
    providerName: string | null
    patientNameSearch: string
  }
) => {
  let filtered = bookings

  if (filters.statuses.length > 0) {
    filtered = filtered.filter(b => filters.statuses.includes(b.status))
  }

  if (filters.providerName) {
    filtered = filtered.filter(b => b.provider_name === filters.providerName)
  }

  if (filters.patientNameSearch) {
    const searchLower = filters.patientNameSearch.toLowerCase()
    filtered = filtered.filter(b => 
      b.patient.full_name.toLowerCase().includes(searchLower) ||
      b.patient.email.toLowerCase().includes(searchLower)
    )
  }

  return filtered
} 