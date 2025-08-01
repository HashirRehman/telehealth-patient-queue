'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBookings } from '@/hooks/useBookings'
import { PatientTelehealthCard } from '@/components/patient/PatientTelehealthCard'

export default function PatientPortal() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { myBookings, isLoading } = useBookings()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

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

  // Filter appointments by type
  const telehealthAppointments = myBookings.filter(b => b.booking_type === 'online')
  const inPersonAppointments = myBookings.filter(b => b.booking_type === 'pre-booked')

  // Get active telehealth appointment
  const activeTelehealthAppointment = telehealthAppointments.find(b => 
    ['confirmed', 'intake', 'ready-for-provider', 'provider'].includes(b.status)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Portal</h1>
            <p className="text-gray-600 mt-1">Manage your appointments and telehealth sessions</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Active Telehealth Session */}
        {activeTelehealthAppointment && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Active Telehealth Appointment</CardTitle>
              <CardDescription className="text-blue-700">
                You have an active telehealth appointment. Click the button below to join.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientTelehealthCard
                booking={activeTelehealthAppointment}
                isPatientView={true}
                showActions={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Telehealth Appointments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Telehealth Appointments</CardTitle>
            <CardDescription>Your online video consultation appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {telehealthAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">No telehealth appointments scheduled</p>
                <Button onClick={() => router.push('/dashboard')}>
                  Schedule Telehealth Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {telehealthAppointments.map((booking) => (
                  <PatientTelehealthCard
                    key={booking.id}
                    booking={booking}
                    isPatientView={true}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In-Person Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>In-Person Appointments</CardTitle>
            <CardDescription>Your scheduled visits to the healthcare facility</CardDescription>
          </CardHeader>
          <CardContent>
            {inPersonAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500">No in-person appointments scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inPersonAppointments.map((booking) => (
                  <PatientTelehealthCard
                    key={booking.id}
                    booking={booking}
                    isPatientView={true}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 