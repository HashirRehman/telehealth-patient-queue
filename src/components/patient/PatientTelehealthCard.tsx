'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { BookingWithPatient } from '@/lib/database.types'
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  MailIcon,
  FileTextIcon,
  VideoIcon,
  BuildingIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  ClipboardIcon,
  TimerIcon,
  MapPinIcon
} from 'lucide-react'

interface PatientTelehealthCardProps {
  booking: BookingWithPatient
  showActions?: boolean
  isPatientView?: boolean
}

const statusConfig = {
  'pending': { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: AlertCircleIcon,
    label: 'Pending'
  },
  'confirmed': { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: CheckCircleIcon,
    label: 'Confirmed'
  },
  'intake': { 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: ClipboardIcon,
    label: 'In Intake'
  },
  'ready-for-provider': { 
    color: 'bg-green-50 text-green-700 border-green-200', 
    icon: CheckCircleIcon,
    label: 'Ready for Provider'
  },
  'provider': { 
    color: 'bg-orange-50 text-orange-700 border-orange-200', 
    icon: VideoIcon,
    label: 'With Provider'
  },
  'ready-for-discharge': { 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
    icon: CheckCircleIcon,
    label: 'Ready for Discharge'
  },
  'discharged': { 
    color: 'bg-gray-50 text-gray-700 border-gray-200', 
    icon: CheckCircleIcon,
    label: 'Discharged'
  },
  'cancelled': { 
    color: 'bg-red-50 text-red-700 border-red-200', 
    icon: XCircleIcon,
    label: 'Cancelled'
  }
}

export function PatientTelehealthCard({ 
  booking, 
  showActions = true, 
  isPatientView = false 
}: PatientTelehealthCardProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatAppointmentType = (booking: BookingWithPatient) => {
    if (booking.is_adhoc) {
      return 'Adhoc'
    }
    const time = new Date(`1970-01-01T${booking.appointment_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return `Booked ${time}`
  }

  const calculateWaitTime = (booking: BookingWithPatient) => {
    const now = new Date()
    const appointmentTime = new Date(`${booking.appointment_date}T${booking.appointment_time}`)
    const createdTime = new Date(booking.created_at)
    
    const currentWait = Math.max(0, Math.floor((now.getTime() - appointmentTime.getTime()) / (1000 * 60)))
    const totalWait = Math.floor((now.getTime() - createdTime.getTime()) / (1000 * 60))
    
    return { currentWait, totalWait }
  }

  const getPatientAction = () => {
    switch (booking.status) {
      case 'confirmed':
        return (
          <Button 
            size="sm"
            onClick={() => router.push(`/waiting-room/${booking.id}`)}
          >
            Join Waiting Room
          </Button>
        )
      case 'intake':
        return (
          <Button 
            size="sm"
            onClick={() => router.push(`/waiting-room/${booking.id}`)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Complete Intake
          </Button>
        )
      case 'ready-for-provider':
        return (
          <div className="text-sm">
            <div className="text-green-600 font-medium flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Ready for Provider
            </div>
            <div className="text-gray-500 mt-1">Your provider will start the call shortly</div>
          </div>
        )
      case 'provider':
        return (
          <Button 
            size="sm"
            onClick={() => router.push(`/video-call/${booking.id}`)}
            className="bg-green-600 hover:bg-green-700"
          >
            <VideoIcon className="w-4 h-4 mr-1" />
            Join Call
          </Button>
        )
      default:
        return null
    }
  }

  const getProviderAction = () => {
    const canJoinCall = ['ready-for-provider', 'provider'].includes(booking.status)
    if (canJoinCall) {
      return (
        <Button 
          size="sm" 
          onClick={() => router.push(`/video-call/${booking.id}`)}
          className="bg-green-600 hover:bg-green-700"
        >
          <VideoIcon className="w-4 h-4 mr-1" />
          Join Call
        </Button>
      )
    }
    return null
  }

  const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig]?.icon || AlertCircleIcon
  const statusStyle = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig['pending']
  const waitTimes = calculateWaitTime(booking)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
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
    <Card className="w-full hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Patient Info */}
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            
            {/* Patient Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {booking.patient.full_name}
                </h3>
                <Badge className={`${statusStyle.color} px-2 py-1 text-xs font-medium shadow-sm`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusStyle.label}
                </Badge>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <MailIcon className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{booking.patient.email}</span>
                </div>
                
                {booking.patient.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                    <span>{booking.patient.phone}</span>
                  </div>
                )}
                
                {booking.patient.date_of_birth && (
                  <div className="flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                    <span>DOB: {new Date(booking.patient.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Type Badge */}
          <Badge 
            className={`ml-4 px-3 py-1 ${booking.booking_type === 'online' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}
          >
            {booking.booking_type === 'online' ? (
              <>
                <VideoIcon className="w-3 h-3 mr-1" />
                Telehealth
              </>
            ) : (
              <>
                <BuildingIcon className="w-3 h-3 mr-1" />
                In-Person
              </>
            )}
          </Badge>
        </div>

        {/* Appointment Details */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{formatDate(booking.appointment_date)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium">{formatTime(booking.appointment_time)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <TimerIcon className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium">{formatAppointmentType(booking)}</p>
              </div>
            </div>

            {waitTimes.currentWait > 0 && (
              <div className="flex items-center">
                <AlertCircleIcon className="w-4 h-4 mr-2 text-orange-400" />
                <div>
                  <p className="text-xs text-gray-500">Wait Time</p>
                  <p className="font-medium text-orange-600">{waitTimes.currentWait}m</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Telehealth Specific Info */}
        {booking.booking_type === 'online' && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {booking.provider_name && (
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Provider</p>
                    <p className="font-medium text-blue-700">{booking.provider_name}</p>
                  </div>
                </div>
              )}
              
              {booking.chief_complaint && (
                <div className="flex items-start">
                  <FileTextIcon className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Chief Complaint</p>
                    <p className="font-medium text-blue-700 leading-relaxed">{booking.chief_complaint}</p>
                  </div>
                </div>
              )}

              {booking.room_location && (
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium text-blue-700">{booking.room_location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <FileTextIcon className="w-4 h-4 mr-2 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 leading-relaxed">{booking.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            {/* Wait Time Info */}
            {['confirmed', 'intake', 'ready-for-provider', 'provider'].includes(booking.status) && (
              <div className="text-xs text-gray-500">
                {booking.status === 'provider' && <span className="text-green-600 font-medium">● Live</span>}
                {booking.status === 'ready-for-provider' && <span className="text-orange-600 font-medium">● Ready</span>}
                {booking.status === 'intake' && <span className="text-purple-600 font-medium">● In Progress</span>}
                {booking.status === 'confirmed' && <span className="text-blue-600 font-medium">● Confirmed</span>}
              </div>
            )}

            {/* Action Button */}
            <div className="ml-auto">
              {isPatientView ? getPatientAction() : getProviderAction()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 