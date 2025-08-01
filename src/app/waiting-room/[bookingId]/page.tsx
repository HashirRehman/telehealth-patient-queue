'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookingService } from '@/lib/bookings'
import type { BookingWithPatient } from '@/lib/database.types'

export default function WaitingRoom() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [booking, setBooking] = useState<BookingWithPatient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  const bookingId = params.bookingId as string

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (bookingId && user) {
      fetchBooking()
    }
  }, [bookingId, user, loading])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!booking) return

    const interval = setInterval(async () => {
      try {
        const bookings = await BookingService.getBookings()
        const updatedBooking = bookings.find(b => b.id === bookingId)
        if (updatedBooking) {
          setBooking(updatedBooking)
          
          if (updatedBooking.status === 'provider') {
            router.push(`/video-call/${bookingId}`)
          }
        }
      } catch (error) {
        console.error('Error polling booking status:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [booking, bookingId, router])

  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking')
      await new Promise(resolve => setTimeout(resolve, 2000))
      setConnectionStatus('connected')
    }

    checkConnection()
  }, [])

  const fetchBooking = async () => {
    try {
      setIsLoading(true)
      const bookings = await BookingService.getBookings()
      const foundBooking = bookings.find(b => b.id === bookingId)
      
      if (!foundBooking) {
        router.push('/dashboard')
        return
      }

      setBooking(foundBooking)

      if (foundBooking.status === 'provider') {
        router.push(`/video-call/${bookingId}`)
      } else if (!['intake', 'ready-for-provider', 'confirmed'].includes(foundBooking.status)) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const leaveWaitingRoom = async () => {
    if (!booking) return
    
    try {
      await BookingService.updateBooking(booking.id, { status: 'confirmed' })
      router.push('/dashboard')
    } catch (error) {
      console.error('Error leaving waiting room:', error)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !booking) {
    return null
  }

  const appointmentTime = new Date(`${booking.appointment_date}T${booking.appointment_time}`)
  const isAppointmentTime = currentTime >= appointmentTime

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Virtual Waiting Room</h1>
          <p className="text-gray-600">Please wait while your healthcare provider prepares for your appointment</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {connectionStatus === 'connected' ? 'Connection Ready' :
                   connectionStatus === 'checking' ? 'Checking Connection...' :
                   'Connection Issues'}
                </span>
              </div>
              {connectionStatus === 'connected' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Appointment Details</span>
              <Badge variant={['intake', 'ready-for-provider'].includes(booking.status) ? 'default' : 'secondary'}>
                {booking.status.replace('-', ' ').replace('_', ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Patient:</span>
                <span className="font-medium">{booking.patient.full_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Scheduled Time:</span>
                <span className="font-medium">
                  {appointmentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })} at {appointmentTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Time:</span>
                <span className="font-medium">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              {booking.notes && (
                <div>
                  <span className="text-gray-600">Notes:</span>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!isAppointmentTime && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800">Early Arrival</p>
                  <p className="text-sm text-yellow-700">
                    Your appointment is scheduled for {appointmentTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}. Please wait until your scheduled time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {['intake', 'ready-for-provider'].includes(booking.status) && isAppointmentTime && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="animate-pulse">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Waiting for Provider</p>
                  <p className="text-sm text-blue-700">
                    Your healthcare provider will join you shortly. Please keep this window open.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Before Your Call</CardTitle>
            <CardDescription>Please ensure the following for the best experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Camera and microphone permissions enabled</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Stable internet connection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Quiet, well-lit environment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Any relevant documents or questions ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={leaveWaitingRoom}>
            Leave Waiting Room
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
} 