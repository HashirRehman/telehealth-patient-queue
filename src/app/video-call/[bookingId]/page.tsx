'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookingService } from '@/lib/bookings'
import type { BookingWithPatient } from '@/lib/database.types'

export default function VideoCall() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [booking, setBooking] = useState<BookingWithPatient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCallStarted, setIsCallStarted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const callStartTimeRef = useRef<Date | null>(null)

  const bookingId = params.bookingId as string

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (bookingId && user) {
      fetchBooking()
    }
  }, [bookingId, user, loading])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isCallStarted && callStartTimeRef.current) {
      interval = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - callStartTimeRef.current!.getTime()) / 1000)
        setCallDuration(duration)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCallStarted])

  const fetchBooking = async () => {
    try {
      setIsLoading(true)
      const bookings = await BookingService.getBookings()
      const foundBooking = bookings.find(b => b.id === bookingId)
      
      if (!foundBooking) {
        router.push('/dashboard')
        return
      }

      setBooking(foundBooking)

      if (foundBooking.status !== 'provider') {

        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const startVideoCall = async () => {
    try {
      setConnectionStatus('connecting')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setTimeout(() => {
        setConnectionStatus('connected')
        setIsCallStarted(true)
        callStartTimeRef.current = new Date()
      }, 2000)

    } catch (error: unknown) {
      console.error('❌ Error starting video call:', error)
      setConnectionStatus('disconnected')
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Camera/microphone access denied. Please enable permissions and try again.')
        } else if (error.name === 'NotFoundError') {
          alert('No camera or microphone found. Please connect a device and try again.')
        } else if (error.name === 'NotReadableError') {
          alert('Camera/microphone is being used by another application. Please close other apps and try again.')
        } else {
          alert(`Unable to access camera/microphone: ${error.message}`)
        }
      } else {
        alert('Unable to access camera/microphone. Please check your permissions and try again.')
      }
    }
  }

  const endCall = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    if (booking) {
      try {
        await BookingService.updateBooking(booking.id, { status: 'ready-for-discharge' })
      } catch (error) {
        console.error('Error updating booking status:', error)
      }
    }

    setIsCallStarted(false)
    setCallDuration(0)
    callStartTimeRef.current = null
    router.push('/dashboard')
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !booking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Video Consultation</h1>
            <p className="text-gray-300">{booking.patient.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            {isCallStarted && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white font-mono">{formatDuration(callDuration)}</span>
              </div>
            )}
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
              {connectionStatus}
            </Badge>
          </div>
        </div>

        {!isCallStarted ? (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Ready to Start Video Call?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative aspect-video bg-gray-700 rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary">You</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white font-medium">Before you start:</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Camera and microphone will be activated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                             <span>Ensure you&apos;re in a quiet, well-lit environment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Have any relevant documents ready</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 relative">
                  <Button
                    onClick={startVideoCall}
                    disabled={connectionStatus === 'connecting'}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    {connectionStatus === 'connecting' ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Connecting...
                      </div>
                    ) : 'Start Video Call'}
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    Cancel
                  </Button>
                  
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                    Status: {connectionStatus} | Started: {isCallStarted ? 'Yes' : 'No'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh]">
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-white">{booking.patient.full_name}</p>
                    <p className="text-gray-400 text-sm">Waiting to connect...</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary">{booking.patient.full_name}</Badge>
                </div>
              </div>

              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary">You</Badge>
                </div>
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm">Camera Off</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 py-4">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleMute}
                className="rounded-full w-14 h-14"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </Button>

              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-14 h-14"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isVideoOff ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                </svg>
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full w-14 h-14"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17l-1.5-1.5m0 0L5.485 10.485m0 0L4 9M9 5l2-2 2 2m0 0L9 9l4 4 2-2" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 