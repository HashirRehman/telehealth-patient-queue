'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookingWithPatient } from '@/lib/database.types'
import { useBookings } from '@/hooks/useBookings'
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  PhoneIcon, 
  MailIcon,
  FileTextIcon,
  VideoIcon,
  BuildingIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon
} from 'lucide-react'

interface BookingCardProps {
  booking: BookingWithPatient
}

const statusConfig = {
  'pending': { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: AlertCircleIcon,
    bgGradient: 'from-amber-50 to-amber-100'
  },
  'confirmed': { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: CheckCircleIcon,
    bgGradient: 'from-blue-50 to-blue-100'
  },
  'intake': { 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: FileTextIcon,
    bgGradient: 'from-purple-50 to-purple-100'
  },
  'ready-for-provider': { 
    color: 'bg-green-50 text-green-700 border-green-200', 
    icon: CheckCircleIcon,
    bgGradient: 'from-green-50 to-green-100'
  },
  'provider': { 
    color: 'bg-orange-50 text-orange-700 border-orange-200', 
    icon: VideoIcon,
    bgGradient: 'from-orange-50 to-orange-100'
  },
  'ready-for-discharge': { 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
    icon: CheckCircleIcon,
    bgGradient: 'from-indigo-50 to-indigo-100'
  },
  'discharged': { 
    color: 'bg-gray-50 text-gray-700 border-gray-200', 
    icon: CheckCircleIcon,
    bgGradient: 'from-gray-50 to-gray-100'
  },
  'cancelled': { 
    color: 'bg-red-50 text-red-700 border-red-200', 
    icon: XCircleIcon,
    bgGradient: 'from-red-50 to-red-100'
  }
}

const typeConfig = {
  'pre-booked': { 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
    icon: BuildingIcon,
    label: 'In-Person'
  },
  'online': { 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
    icon: VideoIcon,
    label: 'Telehealth'
  }
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

  const StatusIcon = statusConfig[booking.status]?.icon || AlertCircleIcon
  const TypeIcon = typeConfig[booking.booking_type]?.icon || BuildingIcon
  const statusStyle = statusConfig[booking.status] || statusConfig['pending']
  const typeStyle = typeConfig[booking.booking_type] || typeConfig['pre-booked']

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card className={`w-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br ${statusStyle.bgGradient} backdrop-blur-sm`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                {booking.patient.full_name}
              </CardTitle>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
                  {booking.patient.email}
                </div>
                
                {booking.patient.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {booking.patient.phone}
                  </div>
                )}
                
                {booking.patient.date_of_birth && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                    DOB: {new Date(booking.patient.date_of_birth).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Badge className={`${statusStyle.color} px-3 py-1 font-medium shadow-sm`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {booking.status.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge className={`${typeStyle.color} px-3 py-1 font-medium shadow-sm`}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeStyle.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-white/60 rounded-lg p-4 space-y-3 shadow-sm">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
            Appointment Details
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">{formatDate(booking.appointment_date)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium">{formatTime(booking.appointment_time)}</p>
              </div>
            </div>
          </div>

          {booking.booking_type === 'online' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {booking.provider_name && (
                <div className="flex items-center mb-2">
                  <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Provider</p>
                    <p className="text-sm font-medium">{booking.provider_name}</p>
                  </div>
                </div>
              )}
              
              {booking.chief_complaint && (
                <div className="flex items-start">
                  <FileTextIcon className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Chief Complaint</p>
                    <p className="text-sm text-gray-700">{booking.chief_complaint}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {booking.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-start">
                <FileTextIcon className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700">{booking.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/60 rounded-lg p-4 space-y-3 shadow-sm">
          <h4 className="font-semibold text-gray-800">Quick Actions</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <Select
                value={booking.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="intake">Intake</SelectItem>
                  <SelectItem value="ready-for-provider">Ready for Provider</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="ready-for-discharge">Ready for Discharge</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <Select
                value={booking.booking_type}
                onValueChange={handleTypeChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-booked">In-Person</SelectItem>
                  <SelectItem value="online">Telehealth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              disabled={isUpdating}
              className="flex-1"
            >
              <XCircleIcon className="w-4 h-4 mr-1" />
              Delete
            </Button>
            
            {booking.booking_type === 'online' && booking.status === 'provider' && (
              <Button
                onClick={() => window.open(`/video-call/${booking.id}`, '_blank')}
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <VideoIcon className="w-4 h-4 mr-1" />
                Join Call
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 border-t pt-3">
          <div className="flex justify-between">
            <span>Created: {new Date(booking.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(booking.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 