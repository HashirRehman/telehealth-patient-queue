'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { BookingWithPatient } from '@/lib/database.types'
import {
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  FileTextIcon,
  VideoIcon,
  BuildingIcon,
  ClipboardIcon,
  ActivityIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EditIcon,
  SaveIcon
} from 'lucide-react'

interface PatientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingWithPatient | null
  onUpdateNotes?: (bookingId: string, notes: string) => Promise<void>
}

const statusConfig = {
  'pending': { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: AlertCircleIcon,
    label: 'Pending Confirmation'
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

export function PatientDetailsModal({ 
  isOpen, 
  onClose, 
  booking, 
  onUpdateNotes 
}: PatientDetailsModalProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  if (!booking) return null

  const StatusIcon = statusConfig[booking.status]?.icon || AlertCircleIcon
  const statusStyle = statusConfig[booking.status] || statusConfig['pending']

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const calculateWaitTime = () => {
    const now = new Date()
    const appointmentTime = new Date(`${booking.appointment_date}T${booking.appointment_time}`)
    const diffInMinutes = Math.floor((now.getTime() - appointmentTime.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 0) return 'Appointment upcoming'
    if (diffInMinutes === 0) return 'Just started'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes`
    
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const handleEditNotes = () => {
    setNotes(booking.notes || '')
    setIsEditingNotes(true)
  }

  const handleSaveNotes = async () => {
    if (!onUpdateNotes) return
    
    setIsSavingNotes(true)
    try {
      await onUpdateNotes(booking.id, notes)
      setIsEditingNotes(false)
    } catch (error) {
      console.error('Error updating notes:', error)
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleCancelEdit = () => {
    setNotes(booking.notes || '')
    setIsEditingNotes(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {booking.patient.full_name}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Patient ID: {booking.patient.id.slice(0, 8)}...
                </DialogDescription>
              </div>
            </div>
            
            <Badge className={`${statusStyle.color} px-4 py-2 font-medium text-sm shadow-sm`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusStyle.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold">{booking.patient.full_name}</p>
                </div>
                
                {booking.patient.date_of_birth && (
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-semibold">{calculateAge(booking.patient.date_of_birth)} years old</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <MailIcon className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{booking.patient.email}</p>
                  </div>
                </div>

                {booking.patient.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{booking.patient.phone}</p>
                    </div>
                  </div>
                )}

                {booking.patient.date_of_birth && (
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{new Date(booking.patient.date_of_birth).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {booking.patient.address && (
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{booking.patient.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CalendarIcon className="w-5 h-5 mr-2 text-green-500" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{formatDate(booking.appointment_date)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold">{formatTime(booking.appointment_time)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <div className="flex items-center">
                    {booking.booking_type === 'online' ? (
                      <>
                        <VideoIcon className="w-4 h-4 mr-2 text-emerald-500" />
                        <span className="font-semibold">Telehealth</span>
                      </>
                    ) : (
                      <>
                        <BuildingIcon className="w-4 h-4 mr-2 text-indigo-500" />
                        <span className="font-semibold">In-Person</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Wait Time</p>
                  <p className="font-semibold text-orange-600">{calculateWaitTime()}</p>
                </div>
              </div>

              {booking.provider_name && (
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-semibold">{booking.provider_name}</p>
                </div>
              )}

              {booking.chief_complaint && (
                <div>
                  <p className="text-sm text-gray-500">Chief Complaint</p>
                  <p className="font-medium text-gray-700">{booking.chief_complaint}</p>
                </div>
              )}

              {booking.room_location && (
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{booking.room_location}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical History & Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <FileTextIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Notes & Medical History
                </CardTitle>
                
                {!isEditingNotes && (
                  <Button 
                    onClick={handleEditNotes}
                    variant="outline" 
                    size="sm"
                  >
                    <EditIcon className="w-4 h-4 mr-1" />
                    Edit Notes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about the patient's condition, treatment, or observations..."
                    rows={6}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      size="sm"
                    >
                      <SaveIcon className="w-4 h-4 mr-1" />
                      {isSavingNotes ? 'Saving...' : 'Save Notes'}
                    </Button>
                    <Button 
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {booking.notes ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <FileTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No notes available for this patient.</p>
                                             <p className="text-sm text-gray-400 mt-1">Click &quot;Edit Notes&quot; to add medical notes or observations.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ActivityIcon className="w-5 h-5 mr-2 text-orange-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {booking.booking_type === 'online' && booking.status === 'provider' && (
                  <Button 
                    onClick={() => window.open(`/video-call/${booking.id}`, '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Join Video Call
                  </Button>
                )}
                
                <Button variant="outline">
                  <FileTextIcon className="w-4 h-4 mr-2" />
                  View Medical Records
                </Button>
                
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
                
                <Button variant="outline">
                  <MailIcon className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 