'use client'

import React, { memo } from 'react'
import { Card, CardContent } from '@/components/ui'
import { FileX, Users, Calendar } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: 'files' | 'users' | 'calendar'
  className?: string
}

const iconMap = {
  files: FileX,
  users: Users,
  calendar: Calendar
}

const EmptyState = memo(function EmptyState({ 
  title, 
  description,
  icon = 'files',
  className = ''
}: EmptyStateProps) {
  const IconComponent = iconMap[icon]

  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <IconComponent className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 max-w-sm">{description}</p>
        )}
      </CardContent>
    </Card>
  )
})

export { EmptyState } 