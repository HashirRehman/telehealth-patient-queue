'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookingWithPatient } from '@/lib/database.types'
import { useBookings } from '@/hooks/useBookings'

interface BookingCardProps {
  booking: BookingWithPatient
}

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'confirmed': 'bg-blue-100 text-blue-800',
  'waiting-room': 'bg-purple-100 text-purple-800',
  'in-call': 'bg-green-100 text-green-800',
  'completed': 'bg-gray-100 text-gray-800',
  'cancelled': 'bg-red-100 text-red-800'
}

const typeColors = {
  'pre-booked': 'bg-indigo-100 text-indigo-800',
  'online': 'bg-emerald-100 text-emerald-800'
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { updateBookingStatus, updateBookingType, deleteBooking } = useBookings()

  const handleStatusChange = async (newStatus: BookingWithPatient['status']) => {
    setIsUpdating(true)
    try {
      await updateBookingStatus(booking.id, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTypeChange = async (newType: BookingWithPatient['booking_type']) => {
    setIsUpdating(true)
    try {
      await updateBookingType(booking.id, newType)
    } catch (error) {
      console.error('Error updating type:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return
    }

    setIsUpdating(true)
    try {
      await deleteBooking(booking.id)
    } catch (error) {
      console.error('Error deleting booking:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.patient.full_name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{booking.patient.email}</p>
            {booking.patient.phone && (
              <p className="text-sm text-gray-600">{booking.patient.phone}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge className={statusColors[booking.status] || 'bg-gray-100 text-gray-800'}>
              {booking.status.replace('-', ' ')}
            </Badge>
            <Badge className={typeColors[booking.booking_type] || 'bg-gray-100 text-gray-800'}>
              {booking.booking_type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Appointment Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Date:</span>
            <span>{new Date(booking.appointment_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Time:</span>
            <span>{new Date(`1970-01-01T${booking.appointment_time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}</span>
          </div>
          {booking.notes && (
            <div className="text-sm">
              <span className="font-medium">Notes:</span>
              <p className="text-gray-600 mt-1">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Status Update */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status:</label>
          <Select
            value={booking.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="waiting-room">Waiting Room</SelectItem>
              <SelectItem value="in-call">In Call</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Update */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type:</label>
          <Select
            value={booking.booking_type}
            onValueChange={handleTypeChange}
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pre-booked">Pre-booked</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isUpdating}
            className="flex-1"
          >
            {isUpdating ? 'Updating...' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 