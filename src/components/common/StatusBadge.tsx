'use client'

import React, { memo } from 'react'
import { Badge } from '@/components/ui'
import { getStatusConfig } from '@/lib/constants/status'

interface StatusBadgeProps {
  status: string
  showIcon?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5', 
  lg: 'text-base px-4 py-2'
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

const StatusBadge = memo(function StatusBadge({ 
  status, 
  showIcon = true,
  className = '',
  size = 'md'
}: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const StatusIcon = config.icon

  return (
    <Badge 
      className={`
        ${config.color} 
        ${sizeClasses[size]}
        ${className} 
        inline-flex items-center gap-1.5 transition-all duration-200 hover:shadow-sm
      `}
    >
      {showIcon && <StatusIcon className={iconSizes[size]} />}
      <span className="font-medium">{config.label}</span>
    </Badge>
  )
})

export { StatusBadge } 