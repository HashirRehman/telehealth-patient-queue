'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useBookings } from '@/hooks/useBookings'
import CreateBookingForm from '@/components/admin/CreateBookingForm'
import { PatientTelehealthCard } from '@/components/patient/PatientTelehealthCard'

export default function Dashboard() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const { myBookings, isLoading, getUpcomingBookings, getCompletedBookings } = useBookings()
  const [showCreateBooking, setShowCreateBooking] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push('/login')
    }
  }

  const handleCreateBookingSuccess = () => {
    setShowCreateBooking(false)
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const upcomingCount = myBookings.filter(b => 
    ['confirmed', 'intake', 'ready-for-provider', 'provider'].includes(b.status)
  ).length
  const completedCount = myBookings.filter(b => 
    ['ready-for-discharge', 'discharged'].includes(b.status)
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back to your hospital portal</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowCreateBooking(true)}>
              Book Appointment
            </Button>
            <Button onClick={() => router.push('/admin')} variant="outline">
              Admin Panel
            </Button>
            <Button 
              onClick={() => {
                // Check for any online booking that patient can join
                const onlineBooking = myBookings.find(b => 
                  b.booking_type === 'online' && 
                  ['confirmed', 'intake', 'ready-for-provider', 'provider'].includes(b.status)
                )
                if (onlineBooking) {
                  // If in provider status, go directly to video call
                  if (onlineBooking.status === 'provider') {
                    router.push(`/video-call/${onlineBooking.id}`)
                  } else {
                    // Otherwise go to waiting room
                    router.push(`/waiting-room/${onlineBooking.id}`)
                  }
                } else {
                  router.push('/telehealth-queue')
                }
              }} 
              variant="outline"
            >
              Telehealth
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myBookings.length}</div>
              <p className="text-xs text-gray-500 mt-1">Total appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
              <p className="text-xs text-gray-500 mt-1">Scheduled appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <p className="text-xs text-gray-500 mt-1">Past appointments</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Your latest booking activity</CardDescription>
              </div>
              <Button onClick={() => setShowCreateBooking(true)} size="sm">
                + New Appointment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">No appointments scheduled yet</p>
                <Button onClick={() => setShowCreateBooking(true)}>
                  Book Your First Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.slice(0, 5).map((booking) => (
                  <PatientTelehealthCard
                    key={booking.id}
                    booking={booking}
                    isPatientView={true}
                    showActions={booking.booking_type === 'online'}
                  />
                ))}
                {myBookings.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                      View All Appointments ({myBookings.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Booking Modal */}
      {showCreateBooking && (
        <CreateBookingForm
          onSuccess={handleCreateBookingSuccess}
          onCancel={() => setShowCreateBooking(false)}
          isPatientView={true}
        />
      )}
    </div>
  )
} 