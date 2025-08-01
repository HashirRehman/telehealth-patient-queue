'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBookings } from '@/hooks/useBookings'
import { BookingService } from '@/lib/bookings'
import type { BookingWithPatient, TelehealthStatus, QueueTab, QueueFilters } from '@/lib/database.types'
import { PatientTelehealthCard } from '@/components/patient/PatientTelehealthCard'
import { QueueStatusFlow } from '@/components/telehealth/QueueStatusFlow'
import '@/lib/debug-booking-status' // Load debug utilities
import '@/lib/database-check' // Load database check utilities
import { ChevronDownIcon, ChevronUpIcon, MoreVerticalIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { PatientDetailsModal } from '@/components/patient/PatientDetailsModal'

export default function TelehealthQueue() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { bookings, isLoading } = useBookings()
  const [activeTab, setActiveTab] = useState<QueueTab>('pre-booked')
  const [filters, setFilters] = useState<QueueFilters>({
    statuses: [],
    providerName: null,
    patientNameSearch: ''
  })
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [selectedPatient, setSelectedPatient] = useState<BookingWithPatient | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const allStatuses: TelehealthStatus[] = ['pending', 'confirmed', 'intake', 'ready-for-provider', 'provider', 'ready-for-discharge', 'discharged']
  const providers = [...new Set(bookings.filter(b => b.provider_name).map(b => b.provider_name))]

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Filter bookings based on tab and filters
  const getFilteredBookings = () => {
    let filtered = bookings

    // Tab filtering
    switch (activeTab) {
      case 'pre-booked':
        // Pre-booked: appointments that aren't online, in waiting room, video call or completed
        filtered = filtered.filter(b => 
          !['intake', 'ready-for-provider', 'provider', 'ready-for-discharge', 'discharged'].includes(b.status)
        )
        break
      case 'in-office':
        // In Office: patients currently in the telehealth workflow
        filtered = filtered.filter(b => 
          ['intake', 'ready-for-provider', 'provider'].includes(b.status)
        )
        break
      case 'completed':
        // Completed: patients who have been discharged
        filtered = filtered.filter(b => 
          ['ready-for-discharge', 'discharged'].includes(b.status)
        )
        break
    }

    // Status filtering
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(b => filters.statuses.includes(b.status as TelehealthStatus))
    }

    // Provider filtering
    if (filters.providerName) {
      filtered = filtered.filter(b => b.provider_name === filters.providerName)
    }

    // Patient name search (fuzzy)
    if (filters.patientNameSearch) {
      const searchTerm = filters.patientNameSearch.toLowerCase()
      filtered = filtered.filter(b => 
        b.patient.full_name.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  }

  const filteredBookings = getFilteredBookings()

  // Get status counts for current tab
  const getStatusCounts = () => {
    const tabBookings = getFilteredBookings()
    const counts: Record<TelehealthStatus, number> = {
      'pending': 0,
      'confirmed': 0,
      'intake': 0,
      'ready-for-provider': 0,
      'provider': 0,
      'ready-for-discharge': 0,
      'discharged': 0,
      'cancelled': 0
    }

    tabBookings.forEach(booking => {
      const status = booking.status as TelehealthStatus
      if (counts[status] !== undefined) {
        counts[status]++
      }
    })

    return counts
  }

  const statusCounts = getStatusCounts()

  // Group bookings for in-office tab
  const getGroupedBookings = () => {
    if (activeTab !== 'in-office') return null

    const inIntake = filteredBookings.filter(b => b.status === 'intake')
    const readyForProvider = filteredBookings.filter(b => b.status === 'ready-for-provider')
    const inCall = filteredBookings.filter(b => b.status === 'provider')

    return {
      'in-intake': {
        name: 'In Intake',
        bookings: inIntake,
        count: inIntake.length
      },
      'ready-for-provider': {
        name: 'Ready for Provider',
        bookings: readyForProvider,
        count: readyForProvider.length
      },
      'in-call': {
        name: 'In Call',
        bookings: inCall,
        count: inCall.length
      }
    }
  }

  const groupedBookings = getGroupedBookings()

  const updateBookingStatus = async (bookingId: string, newStatus: TelehealthStatus) => {
    setIsUpdating(bookingId)
    try {
      await BookingService.updateBooking(bookingId, { status: newStatus })
      console.log(`Successfully updated booking ${bookingId} to status: ${newStatus}`)
      // Data will be refreshed automatically via optimistic updates
    } catch (error: unknown) {
      console.error('Error updating booking status:', error)
      
      // Extract meaningful error message
      let errorMessage = 'Unknown error'
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        } else if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error
        } else if ('details' in error && typeof error.details === 'string') {
          errorMessage = error.details
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      console.error('Detailed error:', {
        error,
        message: errorMessage,
        bookingId,
        newStatus
      })
      
      // Show user-friendly error message
      alert(`Failed to update patient status to ${newStatus}.\n\nError: ${errorMessage}\n\nPlease check the browser console for more details.`)
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'intake': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ready-for-provider': return 'bg-green-100 text-green-800 border-green-200'
      case 'provider': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'ready-for-discharge': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'discharged': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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

  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey)
    } else {
      newCollapsed.add(groupKey)
    }
    setCollapsedGroups(newCollapsed)
  }

    const renderPatientCard = (booking: BookingWithPatient) => {
    const canIntake = ['pending', 'confirmed', 'intake'].includes(booking.status)
    const canMoveToProvider = booking.status === 'ready-for-provider'
    const canCompleteCall = booking.status === 'provider'

    return (
      <div key={booking.id} className="relative">
        <PatientTelehealthCard
          booking={booking}
          isPatientView={false}
          showActions={false}
        />
        
        {/* Provider Actions - positioned in the card */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Priority Badge for Ready Patients */}
          {booking.status === 'ready-for-provider' && (
            <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">
              Ready Now
            </Badge>
          )}
          
          {/* Quick Action Buttons */}
          {canMoveToProvider && (
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => updateBookingStatus(booking.id, 'provider')}
              disabled={isUpdating === booking.id}
            >
              Start Call
            </Button>
          )}
          
          {canCompleteCall && (
            <Button 
              size="sm"
              variant="outline"
              onClick={() => updateBookingStatus(booking.id, 'ready-for-discharge')}
              disabled={isUpdating === booking.id}
            >
              End Call
            </Button>
          )}
          
          {booking.status === 'provider' && (
            <Button 
              size="sm"
              onClick={() => router.push(`/video-call/${booking.id}`)}
              disabled={isUpdating === booking.id}
            >
              Join Call
            </Button>
          )}

          {/* Context Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPatient(booking)}>
                View Patient
              </DropdownMenuItem>
              
              {canIntake && (
                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'intake')}>
                  Move to Intake
                </DropdownMenuItem>
              )}
              
              {booking.status === 'intake' && (
                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'ready-for-provider')}>
                  Ready for Provider
                </DropdownMenuItem>
              )}
              
              {canMoveToProvider && (
                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'provider')}>
                  Start Call
                </DropdownMenuItem>
              )}
              
              {canCompleteCall && (
                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'ready-for-discharge')}>
                  End Call
                </DropdownMenuItem>
              )}
              
              {booking.status === 'ready-for-discharge' && (
                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'discharged')}>
                  Discharge Patient
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                className="text-red-600"
              >
                Cancel Appointment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Telehealth Queue</h1>
            <p className="text-gray-600 mt-1">Manage patient appointments and telehealth workflow</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/admin')} variant="outline">
              Back to Admin
            </Button>
          </div>
        </div>

        {/* Status Flow Guide */}
        <QueueStatusFlow />

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Status Filter */}
              <div className="flex-1 min-w-48">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Patient Status {filters.statuses.length > 0 && `(${filters.statuses.length})`}
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {allStatuses.map(status => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={filters.statuses.includes(status)}
                                                 onCheckedChange={(checked: boolean) => {
                           if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              statuses: [...prev.statuses, status]
                            }))
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              statuses: prev.statuses.filter(s => s !== status)
                            }))
                          }
                        }}
                      >
                        {status.replace('-', ' ').toUpperCase()} [{statusCounts[status]}]
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, statuses: [] }))}>
                      Clear All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

                             {/* Provider Filter */}
               <div className="flex-1 min-w-48">
                 <Select 
                   value={filters.providerName || 'all-providers'} 
                   onValueChange={(value) => setFilters(prev => ({ ...prev, providerName: value === 'all-providers' ? null : value }))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Provider Name" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all-providers">All Providers</SelectItem>
                     {providers.map(provider => (
                       <SelectItem key={provider} value={provider!}>
                         {provider}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

              {/* Patient Name Search */}
              <div className="flex-1 min-w-48">
                <Input
                  placeholder="Search patient name..."
                  value={filters.patientNameSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, patientNameSearch: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QueueTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pre-booked">
              Pre-booked ({bookings.filter(b => !['intake', 'ready-for-provider', 'provider', 'ready-for-discharge', 'discharged'].includes(b.status)).length})
            </TabsTrigger>
            <TabsTrigger value="in-office">
              In Office ({bookings.filter(b => ['intake', 'ready-for-provider', 'provider'].includes(b.status)).length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({bookings.filter(b => ['ready-for-discharge', 'discharged'].includes(b.status)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pre-booked" className="mt-6">
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No pre-booked appointments found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map(renderPatientCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="in-office" className="mt-6">
            {groupedBookings && (
              <div className="space-y-6">
                {Object.entries(groupedBookings)
                  .filter(([_, group]) => group.count > 0)
                  .map(([groupKey, group]) => (
                    <Card key={groupKey}>
                      <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleGroup(groupKey)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {group.name}
                            <Badge variant="secondary">{group.count}</Badge>
                          </CardTitle>
                          {collapsedGroups.has(groupKey) ? 
                            <ChevronUpIcon className="h-5 w-5" /> : 
                            <ChevronDownIcon className="h-5 w-5" />
                          }
                        </div>
                      </CardHeader>
                      {!collapsedGroups.has(groupKey) && (
                        <CardContent>
                          <div className="space-y-4">
                            {group.bookings.map(renderPatientCard)}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                
                {Object.values(groupedBookings).every(group => group.count === 0) && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No patients currently in office</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No completed appointments found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map(renderPatientCard)
              )}
            </div>
                      </TabsContent>
          </Tabs>
        </div>

        {/* Patient Details Modal */}
        <PatientDetailsModal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          booking={selectedPatient}
          onUpdateNotes={async (bookingId: string, notes: string) => {
            await BookingService.updateBooking(bookingId, { notes })
            // Refresh bookings to show updated notes
            window.location.reload()
          }}
        />
      </div>
    )
  } 