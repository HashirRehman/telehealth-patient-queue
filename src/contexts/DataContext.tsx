'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { BookingService, PatientService } from '@/lib/bookings'
import { BookingWithPatient, Patient } from '@/lib/database.types'
import { useAuth } from './AuthContext'

interface DataContextType {
  // Data
  bookings: BookingWithPatient[]
  patients: Patient[]
  myBookings: BookingWithPatient[]
  myPatients: Patient[]
  stats: {
    total: number
    byStatus: Record<string, number>
    byType: Record<string, number>
  } | null

  isLoading: boolean
  isRefreshing: boolean

  refreshData: () => Promise<void>
  refreshBookings: () => Promise<void>
  refreshPatients: () => Promise<void>

  addBookingOptimistic: (booking: BookingWithPatient) => void
  updateBookingOptimistic: (
    bookingId: string,
    updates: Partial<BookingWithPatient>
  ) => void
  deleteBookingOptimistic: (bookingId: string) => void
  addPatientOptimistic: (patient: Patient) => void
  updatePatientOptimistic: (
    patientId: string,
    updates: Partial<Patient>
  ) => void
  deletePatientOptimistic: (patientId: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const [bookings, setBookings] = useState<BookingWithPatient[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<{
    total: number
    byStatus: Record<string, number>
    byType: Record<string, number>
  } | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const myBookings = bookings.filter(booking => booking.created_by === user?.id)
  const myPatients = patients.filter(patient => patient.user_id === user?.id)

  const calculateStats = useCallback((bookingData: BookingWithPatient[]) => {
    const total = bookingData.length
    const byStatus: Record<string, number> = {}
    const byType: Record<string, number> = {}

    bookingData.forEach(booking => {
      byStatus[booking.status] = (byStatus[booking.status] || 0) + 1
      byType[booking.booking_type] = (byType[booking.booking_type] || 0) + 1
    })

    return { total, byStatus, byType }
  }, [])

  // Fetch all data
  const fetchAllData = useCallback(
    async (showLoading = true) => {
      if (!user) return

      try {
        if (showLoading) {
          setIsLoading(true)
        } else {
          setIsRefreshing(true)
        }

        const [bookingsData, patientsData] = await Promise.all([
          BookingService.getBookings(),
          PatientService.getAllPatients(),
        ])

        setBookings(bookingsData)
        setPatients(patientsData)
        setStats(calculateStats(bookingsData))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user, calculateStats]
  )

  const refreshData = useCallback(() => fetchAllData(false), [fetchAllData])

  const refreshBookings = useCallback(async () => {
    if (!user) return

    try {
      setIsRefreshing(true)
      const bookingsData = await BookingService.getBookings()
      setBookings(bookingsData)
      setStats(calculateStats(bookingsData))
    } catch (error) {
      console.error('Error refreshing bookings:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [user, calculateStats])

  const refreshPatients = useCallback(async () => {
    if (!user) return

    try {
      setIsRefreshing(true)
      const patientsData = await PatientService.getAllPatients()
      setPatients(patientsData)
    } catch (error) {
      console.error('Error refreshing patients:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [user])

  // Optimistic update functions
  const addBookingOptimistic = useCallback(
    (booking: BookingWithPatient) => {
      setBookings(prev => {
        const updated = [booking, ...prev]
        setStats(calculateStats(updated))
        return updated
      })
    },
    [calculateStats]
  )

  const updateBookingOptimistic = useCallback(
    (bookingId: string, updates: Partial<BookingWithPatient>) => {
      setBookings(prev => {
        const updated = prev.map(booking =>
          booking.id === bookingId ? { ...booking, ...updates } : booking
        )
        setStats(calculateStats(updated))
        return updated
      })
    },
    [calculateStats]
  )

  const deleteBookingOptimistic = useCallback(
    (bookingId: string) => {
      setBookings(prev => {
        const updated = prev.filter(booking => booking.id !== bookingId)
        setStats(calculateStats(updated))
        return updated
      })
    },
    [calculateStats]
  )

  const addPatientOptimistic = useCallback((patient: Patient) => {
    setPatients(prev => [patient, ...prev])
  }, [])

  const updatePatientOptimistic = useCallback(
    (patientId: string, updates: Partial<Patient>) => {
      setPatients(prev =>
        prev.map(patient =>
          patient.id === patientId ? { ...patient, ...updates } : patient
        )
      )
    },
    []
  )

  const deletePatientOptimistic = useCallback((patientId: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== patientId))
  }, [])

  useEffect(() => {
    if (user) {
      fetchAllData(true)
    } else {
      // Reset data when user logs out
      setBookings([])
      setPatients([])
      setStats(null)
      setIsLoading(false)
    }
  }, [user, fetchAllData])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, refreshData])

  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refreshData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, refreshData])

  const value: DataContextType = {
    // Data
    bookings,
    patients,
    myBookings,
    myPatients,
    stats,

    // Loading states
    isLoading,
    isRefreshing,

    // Actions
    refreshData,
    refreshBookings,
    refreshPatients,

    // Optimistic updates
    addBookingOptimistic,
    updateBookingOptimistic,
    deleteBookingOptimistic,
    addPatientOptimistic,
    updatePatientOptimistic,
    deletePatientOptimistic,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
