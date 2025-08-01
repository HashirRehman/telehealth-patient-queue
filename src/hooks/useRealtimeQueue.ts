import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { QueueService } from '@/lib/queue'
import type { BookingWithPatient } from '@/lib/database.types'

interface QueueState {
  confirmed: BookingWithPatient[]
  intake: BookingWithPatient[]
  readyForProvider: BookingWithPatient[]
  provider: BookingWithPatient[]
  stats: {
    total: number
    pending: number
    confirmed: number
    intake: number
    readyForProvider: number
    provider: number
    readyForDischarge: number
    discharged: number
    cancelled: number
  } | null
}

export function useRealtimeQueue() {
  const [queueState, setQueueState] = useState<QueueState>({
    confirmed: [],
    intake: [],
    readyForProvider: [],
    provider: [],
    stats: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial queue data
  const fetchQueueData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [queueData, stats] = await Promise.all([
        QueueService.getQueueByStatus(),
        QueueService.getQueueStats()
      ])

      setQueueState({
        confirmed: queueData.confirmed,
        intake: queueData.intake,
        readyForProvider: queueData.readyForProvider,
        provider: queueData.provider,
        stats
      })
    } catch (err) {
      console.error('Error fetching queue data:', err)
      setError('Failed to load queue data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Periodic refresh for queue updates
  const setupPeriodicRefresh = useCallback(() => {
    return setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchQueueData()
      }
    }, 30000) // Refresh every 30 seconds
  }, [fetchQueueData])

  useEffect(() => {
    // Fetch initial data
    fetchQueueData()

    // Set up periodic refresh
    const interval = setupPeriodicRefresh()

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
    }
  }, [fetchQueueData, setupPeriodicRefresh])

  // Refresh queue data manually
  const refreshQueue = async () => {
    await fetchQueueData()
  }

  // Queue management actions
  const moveToIntake = async (bookingId: string) => {
    try {
      await QueueService.moveToIntake(bookingId)
      // Data will be updated via periodic refresh
    } catch (err) {
      console.error('Error moving to intake:', err)
      setError('Failed to move patient to intake')
    }
  }

  const moveToReadyForProvider = async (bookingId: string) => {
    try {
      await QueueService.moveToReadyForProvider(bookingId)
      // Data will be updated via periodic refresh
    } catch (err) {
      console.error('Error moving to ready for provider:', err)
      setError('Failed to move patient to ready for provider')
    }
  }

  const startCall = async (bookingId: string) => {
    try {
      await QueueService.startCall(bookingId)
      // Data will be updated via periodic refresh
    } catch (err) {
      console.error('Error starting call:', err)
      setError('Failed to start call')
    }
  }

  const completeCall = async (bookingId: string) => {
    try {
      await QueueService.completeCall(bookingId)
      // Data will be updated via periodic refresh
    } catch (err) {
      console.error('Error completing call:', err)
      setError('Failed to complete call')
    }
  }

  const dischargePatient = async (bookingId: string) => {
    try {
      await QueueService.dischargePatient(bookingId)
      // Data will be updated via periodic refresh
    } catch (err) {
      console.error('Error discharging patient:', err)
      setError('Failed to discharge patient')
    }
  }

  const removeFromQueue = async (bookingId: string) => {
    try {
      await QueueService.removeFromQueue(bookingId)
      // Data will be updated via periodic refresh
    } catch (err) {
      console.error('Error removing from queue:', err)
      setError('Failed to remove patient from queue')
    }
  }

  const autoAdvanceQueue = async () => {
    try {
      const advanced = await QueueService.autoAdvanceQueue()
      return advanced
    } catch (err) {
      console.error('Error auto-advancing queue:', err)
      setError('Failed to auto-advance queue')
      return false
    }
  }

  return {
    // State
    ...queueState,
    isLoading,
    error,
    
    // Actions
    refreshQueue,
    moveToIntake,
    moveToReadyForProvider,
    startCall,
    completeCall,
    dischargePatient,
    removeFromQueue,
    autoAdvanceQueue,
    
    // Clear error
    clearError: () => setError(null)
  }
} 