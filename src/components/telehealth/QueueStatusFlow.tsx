'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRightIcon } from 'lucide-react'

export function QueueStatusFlow() {
  const statusFlow = [
    { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { status: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { status: 'intake', label: 'Intake', color: 'bg-purple-100 text-purple-800' },
    { status: 'ready-for-provider', label: 'Ready for Provider', color: 'bg-green-100 text-green-800' },
    { status: 'provider', label: 'In Call', color: 'bg-orange-100 text-orange-800' },
    { status: 'ready-for-discharge', label: 'Ready for Discharge', color: 'bg-indigo-100 text-indigo-800' },
    { status: 'discharged', label: 'Discharged', color: 'bg-gray-100 text-gray-800' }
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Telehealth Workflow</CardTitle>
        <CardDescription>
          Patient journey through the telehealth queue system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {statusFlow.map((step, index) => (
            <div key={step.status} className="flex items-center gap-2 flex-shrink-0">
              <Badge className={`${step.color} px-3 py-1`}>
                {step.label}
              </Badge>
              {index < statusFlow.length - 1 && (
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p><strong>Provider Actions:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
                         <li><strong>Ready for Provider → In Call:</strong> Click &quot;Start Call&quot; to begin video session</li>
             <li><strong>In Call → Ready for Discharge:</strong> Click &quot;End Call&quot; when consultation is complete</li>
             <li><strong>Ready for Discharge → Discharged:</strong> Use context menu to discharge patient</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 