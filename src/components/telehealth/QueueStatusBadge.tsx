'use client'

import React, { memo } from 'react'
import { Badge } from '@/components/ui'
import { getStatusConfig } from '@/lib/constants/status'

interface QueueStatusBadgeProps {
  status: string
  className?: string
}

const QueueStatusBadge = memo(function QueueStatusBadge({ 
  status, 
  className = '' 
}: QueueStatusBadgeProps) {
  const config = getStatusConfig(status)
  const StatusIcon = config.icon

  return (
    <Badge className={`${config.color} ${className} inline-flex items-center gap-1 transition-colors duration-200`}>
      <StatusIcon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
})

export { QueueStatusBadge } 