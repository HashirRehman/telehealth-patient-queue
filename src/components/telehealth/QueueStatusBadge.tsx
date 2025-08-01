import { Badge } from '@/components/ui/badge'

interface QueueStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'waiting-room' | 'in-call' | 'completed' | 'cancelled'
  className?: string
}

export function QueueStatusBadge({ status, className }: QueueStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳',
          label: 'Pending'
        }
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '✓',
          label: 'Confirmed'
        }
      case 'waiting-room':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '⏰',
          label: 'Waiting Room'
        }
      case 'in-call':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '📹',
          label: 'In Call'
        }
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅',
          label: 'Completed'
        }
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌',
          label: 'Cancelled'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓',
          label: status
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${className || ''}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  )
} 