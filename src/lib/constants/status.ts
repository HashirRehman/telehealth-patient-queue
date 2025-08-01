import {
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardIcon,
  VideoIcon,
  type LucideIcon,
} from 'lucide-react'

export interface StatusConfig {
  color: string
  icon: LucideIcon
  label: string
  gradient?: string
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircleIcon,
    label: 'Pending Confirmation',
    gradient: 'from-amber-50 to-amber-100',
  },
  confirmed: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircleIcon,
    label: 'Confirmed',
    gradient: 'from-blue-50 to-blue-100',
  },
  intake: {
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: ClipboardIcon,
    label: 'In Intake',
    gradient: 'from-purple-50 to-purple-100',
  },
  'ready-for-provider': {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircleIcon,
    label: 'Ready for Provider',
    gradient: 'from-green-50 to-green-100',
  },
  provider: {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: VideoIcon,
    label: 'With Provider',
    gradient: 'from-orange-50 to-orange-100',
  },
  'ready-for-discharge': {
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: CheckCircleIcon,
    label: 'Ready for Discharge',
    gradient: 'from-indigo-50 to-indigo-100',
  },
  discharged: {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: CheckCircleIcon,
    label: 'Discharged',
    gradient: 'from-gray-50 to-gray-100',
  },
  cancelled: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleIcon,
    label: 'Cancelled',
    gradient: 'from-red-50 to-red-100',
  },
} as const

export const getStatusConfig = (status: string): StatusConfig => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending
}

export const getStatusIcon = (status: string) => {
  return getStatusConfig(status).icon
}

export const getStatusColor = (status: string) => {
  return getStatusConfig(status).color
}

export const getStatusLabel = (status: string) => {
  return getStatusConfig(status).label
}
