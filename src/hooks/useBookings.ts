import { useCallback } from 'react'
import { BookingService } from '@/lib/bookings'
import { BookingInsert, BookingWithPatient } from '@/lib/database.types'
import { useData } from '@/contexts/DataContext'

export function useBookings() {
  const {
    bookings,
    myBookings,
    stats,
    isLoading,
    isRefreshing,
    refreshBookings,
    addBookingOptimistic,
    updateBookingOptimistic,
    deleteBookingOptimistic,
  } = useData()

  const createBooking = useCallback(async (
    patientId: string,
    bookingData: Omit<BookingInsert, 'patient_id' | 'created_by'>
  ): Promise<BookingWithPatient> => {
    try {
      const newBooking = await BookingService.createBooking(patientId, bookingData)
      
      addBookingOptimistic(newBooking)
      
      return newBooking
    } catch (error) {
      await refreshBookings()
      throw error
    }
  }, [addBookingOptimistic, refreshBookings])

  const updateBooking = useCallback(async (
    bookingId: string,
    updates: Partial<BookingInsert>
  ): Promise<BookingWithPatient> => {
    const currentBooking = bookings.find(b => b.id === bookingId)
    if (!currentBooking) {
      throw new Error('Booking not found')
    }

    updateBookingOptimistic(bookingId, updates)

    try {
      const updatedBooking = await BookingService.updateBooking(bookingId, updates)
      
      updateBookingOptimistic(bookingId, updatedBooking)
      
      return updatedBooking
    } catch (error) {
      updateBookingOptimistic(bookingId, currentBooking)
      throw error
    }
  }, [bookings, updateBookingOptimistic])

  const updateBookingStatus = useCallback(async (
    bookingId: string,
    status: 'pending' | 'confirmed' | 'waiting-room' | 'in-call' | 'completed' | 'cancelled'
  ): Promise<BookingWithPatient> => {
    return updateBooking(bookingId, { status })
  }, [updateBooking])

  const updateBookingType = useCallback(async (
    bookingId: string,
    booking_type: 'pre-booked' | 'online'
  ): Promise<BookingWithPatient> => {
    return updateBooking(bookingId, { booking_type })
  }, [updateBooking])

  const deleteBooking = useCallback(async (bookingId: string): Promise<void> => {
    const currentBooking = bookings.find(b => b.id === bookingId)
    if (!currentBooking) {
      throw new Error('Booking not found')
    }

    deleteBookingOptimistic(bookingId)

    try {
      await BookingService.deleteBooking(bookingId)
    } catch (error) {
      addBookingOptimistic(currentBooking)
      throw error
    }
  }, [bookings, deleteBookingOptimistic, addBookingOptimistic])

  const getBookingsByStatus = useCallback((status: string) => {
    return bookings.filter(booking => booking.status === status)
  }, [bookings])

  const getBookingsByType = useCallback((type: string) => {
    return bookings.filter(booking => booking.booking_type === type)
  }, [bookings])

  const getUpcomingBookings = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return myBookings.filter(booking => 
      booking.appointment_date >= today && 
      booking.status !== 'completed' && 
      booking.status !== 'cancelled'
    )
  }, [myBookings])

  const getCompletedBookings = useCallback(() => {
    return myBookings.filter(booking => booking.status === 'completed')
  }, [myBookings])

  return {
    bookings,
    myBookings,
    stats,
    isLoading,
    isRefreshing,
    createBooking,
    updateBooking,
    updateBookingStatus,
    updateBookingType,
    deleteBooking,
    refreshBookings,
    getBookingsByStatus,
    getBookingsByType,
    getUpcomingBookings,
    getCompletedBookings,
  }
} 