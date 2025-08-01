'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import BookingCard from '@/components/admin/BookingCard'
import CreateBookingForm from '@/components/admin/CreateBookingForm'
import { useBookings } from '@/hooks/useBookings'
import { usePatients } from '@/hooks/usePatients'

export default function AdminPanel() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { bookings, stats, isLoading, getBookingsByStatus, getBookingsByType } = useBookings()
  const { patients } = usePatients()
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateBooking, setShowCreateBooking] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const filterBookings = (filter: string) => {
    switch (filter) {
      case 'pre-booked':
        return getBookingsByType('pre-booked')
      case 'online':
        return getBookingsByType('online')
      case 'completed':
        return getBookingsByStatus('completed')
      case 'pending':
        return getBookingsByStatus('pending')
      case 'confirmed':
        return getBookingsByStatus('confirmed')
      case 'waiting-room':
        return getBookingsByStatus('waiting-room')
      case 'in-call':
        return getBookingsByStatus('in-call')
      default:
        return bookings
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

  const filteredBookings = filterBookings(activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">Manage all hospital appointments and patients</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/telehealth-queue')}>
              Telehealth Queue
            </Button>
            <Button onClick={() => setShowCreateBooking(true)}>
              Create Booking
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{patients.length}</div>
                <p className="text-xs text-gray-500 mt-1">Registered patients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500 mt-1">All appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pre-booked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {stats.byType['pre-booked'] || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">In-person bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Online</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.byType['online'] || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Online bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {stats.byStatus['completed'] || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Finished appointments</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Booking Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {bookings.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pre-booked">
              Pre-booked
              <Badge variant="secondary" className="ml-2">
                {stats?.byType['pre-booked'] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="online">
              Online
              <Badge variant="secondary" className="ml-2">
                {stats?.byType['online'] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {stats?.byStatus['pending'] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed
              <Badge variant="secondary" className="ml-2">
                {stats?.byStatus['confirmed'] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="waiting-room">
              Waiting
              <Badge variant="secondary" className="ml-2">
                {stats?.byStatus['waiting-room'] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in-call">
              In Call
              <Badge variant="secondary" className="ml-2">
                {stats?.byStatus['in-call'] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="secondary" className="ml-2">
                {stats?.byStatus['completed'] || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {['all', 'pre-booked', 'online', 'pending', 'confirmed', 'waiting-room', 'in-call', 'completed'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              {filteredBookings.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No bookings found</CardTitle>
                    <CardDescription>
                      There are no bookings in this category yet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setShowCreateBooking(true)}>
                      Create First Booking
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {showCreateBooking && (
        <CreateBookingForm
          onSuccess={handleCreateBookingSuccess}
          onCancel={() => setShowCreateBooking(false)}
          isPatientView={false}
        />
      )}
    </div>
  )
} 