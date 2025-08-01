'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookingService, PatientService } from '@/lib/bookings'
import { useData } from '@/contexts/DataContext'
import type { Patient } from '@/lib/database.types'

interface EnhancedCreateBookingFormProps {
  onSuccess: () => void
  onCancel: () => void
  isPatientView?: boolean
  selectedPatient?: Patient
}

export default function EnhancedCreateBookingForm({
  onSuccess,
  onCancel,
  isPatientView = false,
  selectedPatient,
}: EnhancedCreateBookingFormProps) {
  const { patients, addBookingOptimistic, addPatientOptimistic } = useData()
  const [selectedPatientId, setSelectedPatientId] = useState(
    selectedPatient?.id || ''
  )
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [bookingType, setBookingType] = useState<'pre-booked' | 'online'>(
    'online'
  )
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [newPatientData, setNewPatientData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  })

  useEffect(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    setAppointmentDate(today)

    const nextHour = currentHour + 1
    const nextMinute = Math.ceil(currentMinute / 15) * 15
    const timeString = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`
    setAppointmentTime(timeString)
  }, [])

  const handleCreatePatient = async () => {
    try {
      setIsSubmitting(true)
      setError('')

      if (!newPatientData.full_name || !newPatientData.email) {
        setError('Name and email are required for new patients')
        return
      }

      const newPatient = await PatientService.createPatient(newPatientData)
      addPatientOptimistic(newPatient)
      setSelectedPatientId(newPatient.id)
      setShowNewPatientForm(false)
    } catch (err) {
      console.error('Error creating patient:', err)
      setError('Failed to create patient. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!selectedPatientId) {
        setError('Please select a patient')
        return
      }

      if (!appointmentDate || !appointmentTime) {
        setError('Please select date and time')
        return
      }

      const appointmentDateTime = new Date(
        `${appointmentDate}T${appointmentTime}`
      )
      const now = new Date()

      if (appointmentDateTime <= now) {
        setError('Appointment must be scheduled for a future date and time')
        return
      }

      const selectedPatient = patients.find(p => p.id === selectedPatientId)
      if (!selectedPatient) {
        setError('Selected patient not found')
        return
      }

      const bookingData = {
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        booking_type: bookingType,
        status:
          bookingType === 'online'
            ? ('confirmed' as const)
            : ('pending' as const),
        notes: notes.trim() || null,
      }

      const newBooking = await BookingService.createBooking(
        selectedPatientId,
        bookingData
      )

      const bookingWithPatient = {
        ...newBooking,
        patient: selectedPatient,
      }

      addBookingOptimistic(bookingWithPatient)
      onSuccess()
    } catch (err) {
      console.error('Error creating booking:', err)
      setError('Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRecommendedTimeSlots = () => {
    const slots = []
    const start = 9 // 9 AM
    const end = 17 // 5 PM

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }

    return slots
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Schedule New Appointment</CardTitle>
          <CardDescription>
            Create a new {bookingType === 'online' ? 'telehealth' : 'in-person'}{' '}
            appointment
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setBookingType('online')}
                  className={`flex-1 p-4 border rounded-lg text-left transition-colors ${
                    bookingType === 'online'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Telehealth</p>
                      <p className="text-sm text-gray-500">
                        Online video consultation
                      </p>
                    </div>
                  </div>
                  {bookingType === 'online' && (
                    <Badge className="mt-2">Selected</Badge>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setBookingType('pre-booked')}
                  className={`flex-1 p-4 border rounded-lg text-left transition-colors ${
                    bookingType === 'pre-booked'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">In-Person</p>
                      <p className="text-sm text-gray-500">
                        Visit healthcare facility
                      </p>
                    </div>
                  </div>
                  {bookingType === 'pre-booked' && (
                    <Badge className="mt-2">Selected</Badge>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              {!showNewPatientForm ? (
                <div className="space-y-2">
                  <Select
                    value={selectedPatientId}
                    onValueChange={setSelectedPatientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div>
                            <div className="font-medium">
                              {patient.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.email}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!isPatientView && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewPatientForm(true)}
                    >
                      + Add New Patient
                    </Button>
                  )}
                </div>
              ) : (
                <Card className="p-4 bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">New Patient Information</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPatientForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newPatientName">Full Name *</Label>
                        <Input
                          id="newPatientName"
                          value={newPatientData.full_name}
                          onChange={e =>
                            setNewPatientData(prev => ({
                              ...prev,
                              full_name: e.target.value,
                            }))
                          }
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <Label htmlFor="newPatientEmail">Email *</Label>
                        <Input
                          id="newPatientEmail"
                          type="email"
                          value={newPatientData.email}
                          onChange={e =>
                            setNewPatientData(prev => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="newPatientPhone">Phone</Label>
                        <Input
                          id="newPatientPhone"
                          value={newPatientData.phone}
                          onChange={e =>
                            setNewPatientData(prev => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <Label htmlFor="newPatientDOB">Date of Birth</Label>
                        <Input
                          id="newPatientDOB"
                          type="date"
                          value={newPatientData.date_of_birth}
                          onChange={e =>
                            setNewPatientData(prev => ({
                              ...prev,
                              date_of_birth: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleCreatePatient}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Patient'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select
                  value={appointmentTime}
                  onValueChange={setAppointmentTime}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {getRecommendedTimeSlots().map(time => (
                      <SelectItem key={time} value={time}>
                        {new Date(`1970-01-01T${time}`).toLocaleTimeString(
                          'en-US',
                          {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          }
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special instructions for telehealth */}
            {bookingType === 'online' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Telehealth Appointment
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Patient will receive email instructions before the
                    appointment
                  </li>
                  <li>
                    • Ensure stable internet connection and working
                    camera/microphone
                  </li>
                  <li>
                    • Appointment will start in confirmed status, ready for
                    queue management
                  </li>
                  <li>
                    • Patient can join the waiting room when it&apos;s time for
                    their appointment
                  </li>
                </ul>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional notes about this appointment..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? 'Scheduling...'
                  : `Schedule ${bookingType === 'online' ? 'Telehealth' : 'In-Person'} Appointment`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
