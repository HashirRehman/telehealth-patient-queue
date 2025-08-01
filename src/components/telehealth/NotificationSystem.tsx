'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  bookingId?: string
  patientName?: string
  autoHide?: boolean
}

interface NotificationSystemProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onAction?: (notification: Notification) => void
}

export function NotificationSystem({
  notifications,
  onDismiss,
  onAction,
}: NotificationSystemProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<
    Notification[]
  >([])

  useEffect(() => {
    setVisibleNotifications(notifications)

    const timers = notifications
      .filter(n => n.autoHide)
      .map(notification =>
        setTimeout(() => {
          onDismiss(notification.id)
        }, 5000)
      )

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [notifications, onDismiss])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'success':
        return (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        )
      case 'error':
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const getNotificationColors = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
    }
  }

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map(notification => (
        <Card
          key={notification.id}
          className={`${getNotificationColors(notification.type)} shadow-lg animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {notification.timestamp.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {notification.message}
                </p>

                {notification.patientName && (
                  <p className="text-xs text-gray-500 mb-2">
                    Patient: {notification.patientName}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  {onAction && notification.bookingId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => onAction(notification)}
                    >
                      View
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={() => onDismiss(notification.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export const createNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  options: Partial<Notification> = {}
): Notification => ({
  id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  title,
  message,
  timestamp: new Date(),
  autoHide: type === 'success' || type === 'info',
  ...options,
})

export const QueueNotifications = {
  patientJoinedWaitingRoom: (patientName: string, bookingId: string) =>
    createNotification(
      'info',
      'Patient Joined Waiting Room',
      `${patientName} is now waiting for their appointment.`,
      { patientName, bookingId }
    ),

  callStarted: (patientName: string, bookingId: string) =>
    createNotification(
      'success',
      'Call Started',
      `Video call with ${patientName} has begun.`,
      { patientName, bookingId }
    ),

  callCompleted: (patientName: string, bookingId: string) =>
    createNotification(
      'success',
      'Call Completed',
      `Appointment with ${patientName} has been completed.`,
      { patientName, bookingId, autoHide: true }
    ),

  patientLeftWaitingRoom: (patientName: string) =>
    createNotification(
      'warning',
      'Patient Left',
      `${patientName} has left the waiting room.`,
      { patientName, autoHide: true }
    ),

  connectionIssue: (patientName: string, bookingId: string) =>
    createNotification(
      'error',
      'Connection Issue',
      `There may be a connection issue with ${patientName}&apos;s call.`,
      { patientName, bookingId, autoHide: false }
    ),

  queueEmpty: () =>
    createNotification(
      'info',
      'Queue Empty',
      'No patients are currently waiting in the telehealth queue.',
      { autoHide: true }
    ),

  appointmentReminder: (
    patientName: string,
    bookingId: string,
    minutesUntil: number
  ) =>
    createNotification(
      'info',
      'Upcoming Appointment',
      `${patientName} has an appointment in ${minutesUntil} minutes.`,
      { patientName, bookingId, autoHide: false }
    ),
}
