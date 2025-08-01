'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BookingInsert } from '@/lib/database.types'
import { useAuth } from '@/contexts/AuthContext'
import { useBookings } from '@/hooks/useBookings'
import { usePatients } from '@/hooks/usePatients'

interface CreateBookingFormProps {
  onSuccess: () => void
  onCancel: () => void
  isPatientView?: boolean // New prop to differentiate between patient and admin views
}

export default function CreateBookingForm({ onSuccess, onCancel, isPatientView = false }: CreateBookingFormProps) {
  const { user } = useAuth()
  const { createBooking } = useBookings()
  const { patients, myPatients, createPatient } = usePatients()
  
  const [formData, setFormData] = useState<Omit<BookingInsert, 'patient_id' | 'created_by'>>({
    appointment_date: '',
    appointment_time: '',
    booking_type: 'online',
    status: 'pending',
    notes: ''
  })
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [newPatientData, setNewPatientData] = useState({
    user_id: user?.id || null,
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Get the appropriate patient list based on view type
  const availablePatients = isPatientView ? myPatients : patients

  useEffect(() => {
    if (isPatientView && availablePatients.length === 1) {
      setSelectedPatientId(availablePatients[0].id)
    }
  }, [isPatientView, availablePatients])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (!selectedPatientId) {
        throw new Error('Please select a patient')
      }
      if (!formData.appointment_date || !formData.appointment_time) {
        throw new Error('Please fill in all required fields')
      }

      const appointmentDate = new Date(formData.appointment_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past')
      }

      await createBooking(selectedPatientId, formData)
      setSuccess('Booking created successfully!')

      setFormData({
        appointment_date: '',
        appointment_time: '',
        booking_type: 'online',
        status: 'pending',
        notes: ''
      })
      setSelectedPatientId('')

      setTimeout(() => {
        onSuccess()
      }, 1500)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateNewPatient = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      if (!newPatientData.full_name || !newPatientData.email) {
        throw new Error('Please fill in patient name and email')
      }

      const newPatient = await createPatient(newPatientData)
      setSelectedPatientId(newPatient.id)
      setShowNewPatientForm(false)
      setNewPatientData({
        user_id: user?.id || null,
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      })
      setSuccess('Patient created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNewPatientChange = (field: keyof typeof newPatientData, value: string) => {
    setNewPatientData(prev => ({ ...prev, [field]: value }))
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isPatientView ? 'Book Appointment' : 'Create New Booking'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isPatientView 
                ? 'Schedule your next appointment' 
                : 'Add a new appointment booking for a patient'
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                {isPatientView ? 'Select Patient' : 'Select Patient'} *
              </Label>
              
              {!showNewPatientForm ? (
                <div className="flex gap-3">
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={
                        availablePatients.length === 0 
                          ? "No patients found" 
                          : isPatientView 
                            ? "Choose yourself or family member..." 
                            : "Choose a patient..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{patient.full_name}</span>
                            <span className="text-xs text-gray-500">{patient.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewPatientForm(true)}
                    className="whitespace-nowrap"
                  >
                    + Add Patient
                  </Button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Add New Patient</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPatientForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient_name" className="text-sm font-medium">Full Name *</Label>
                      <Input
                        id="patient_name"
                        value={newPatientData.full_name}
                        onChange={(e) => handleNewPatientChange('full_name', e.target.value)}
                        placeholder="Enter full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patient_email" className="text-sm font-medium">Email *</Label>
                      <Input
                        id="patient_email"
                        type="email"
                        value={newPatientData.email}
                        onChange={(e) => handleNewPatientChange('email', e.target.value)}
                        placeholder="Enter email address"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patient_phone" className="text-sm font-medium">Phone</Label>
                      <Input
                        id="patient_phone"
                        value={newPatientData.phone}
                        onChange={(e) => handleNewPatientChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patient_dob" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="patient_dob"
                        type="date"
                        value={newPatientData.date_of_birth}
                        onChange={(e) => handleNewPatientChange('date_of_birth', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="patient_address" className="text-sm font-medium">Address</Label>
                    <Input
                      id="patient_address"
                      value={newPatientData.address}
                      onChange={(e) => handleNewPatientChange('address', e.target.value)}
                      placeholder="Enter address"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleCreateNewPatient}
                    disabled={isSubmitting}
                    className="w-full mt-4"
                  >
                    {isSubmitting ? 'Adding Patient...' : 'Add Patient'}
                  </Button>
                </div>
              )}
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment_date" className="text-base font-medium">Appointment Date *</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  min={today}
                  value={formData.appointment_date || ''}
                  onChange={(e) => handleChange('appointment_date', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="appointment_time" className="text-base font-medium">Appointment Time *</Label>
                <Input
                  id="appointment_time"
                  type="time"
                  value={formData.appointment_time || ''}
                  onChange={(e) => handleChange('appointment_time', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="booking_type" className="text-base font-medium">Appointment Type</Label>
                <Select
                  value={formData.booking_type || 'online'}
                  onValueChange={(value) => handleChange('booking_type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Consultation</SelectItem>
                    <SelectItem value="pre-booked">In-Person Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isPatientView && (
                <div>
                  <Label htmlFor="status" className="text-base font-medium">Status</Label>
                  <Select
                    value={formData.status || 'pending'}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className="mt-1">
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
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-base font-medium">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                className="mt-1"
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Enter any additional notes or symptoms..."
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 justify-end pt-6 border-t mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || showNewPatientForm}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                isPatientView ? 'Book Appointment' : 'Create Booking'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 