export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatTime = (time: string): string => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age
}

export const calculateWaitTime = (booking: {
  created_at: string
  appointment_date: string
  appointment_time: string
}) => {
  const now = new Date()
  const appointmentTime = new Date(
    `${booking.appointment_date}T${booking.appointment_time}`
  )
  const createdTime = new Date(booking.created_at)

  const currentWait = Math.max(
    0,
    Math.floor((now.getTime() - appointmentTime.getTime()) / (1000 * 60))
  )
  const totalWait = Math.floor(
    (now.getTime() - createdTime.getTime()) / (1000 * 60)
  )

  return { currentWait, totalWait }
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}
