import { useMemo } from 'react'
import { useBookings } from './useBookings'
import { getTabBookings, filterBookings } from '@/lib/utils/booking'
import type {
  TelehealthStatus,
  QueueTab,
} from '@/lib/database.types'

interface QueueFilters {
  statuses: TelehealthStatus[]
  providerName: string | null
  patientNameSearch: string
}

export function useOptimizedBookings() {
  const { myBookings: bookings, isLoading } = useBookings()

  const providers = useMemo(
    () => [
      ...new Set(
        bookings.filter(b => b.provider_name).map(b => b.provider_name!)
      ),
    ],
    [bookings]
  )

  const getFilteredBookings = useMemo(
    () => (tab: QueueTab, filters: QueueFilters) => {
      const tabBookings = getTabBookings(bookings, tab)
      return filterBookings(tabBookings, filters)
    },
    [bookings]
  )

  const stats = useMemo(() => {
    const allStatuses: TelehealthStatus[] = [
      'pending',
      'confirmed',
      'intake',
      'ready-for-provider',
      'provider',
      'ready-for-discharge',
      'discharged',
    ]

    return {
      byStatus: allStatuses.reduce(
        (acc, status) => {
          acc[status] = bookings.filter(b => b.status === status).length
          return acc
        },
        {} as Record<TelehealthStatus, number>
      ),
      total: bookings.length,
    }
  }, [bookings])

  const groupedInOfficeBookings = useMemo(() => {
    const inOfficeBookings = getTabBookings(bookings, 'in-office')

    return {
      intake: inOfficeBookings.filter(b => b.status === 'intake'),
      readyForProvider: inOfficeBookings.filter(
        b => b.status === 'ready-for-provider'
      ),
      provider: inOfficeBookings.filter(b => b.status === 'provider'),
    }
  }, [bookings])

  return {
    bookings,
    isLoading,
    providers,
    getFilteredBookings,
    stats,
    groupedInOfficeBookings,
  }
}
