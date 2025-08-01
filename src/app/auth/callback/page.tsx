'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, XCircleIcon, Loader2Icon } from 'lucide-react'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage(error.message || 'Authentication failed')
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('Email verified successfully! Redirecting to dashboard...')

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          // Check for error in URL params
          const errorDescription = searchParams.get('error_description')
          const error = searchParams.get('error')

          if (error || errorDescription) {
            setStatus('error')
            setMessage(errorDescription || error || 'Authentication failed')
          } else {
            // No session but no error either - might be a valid callback
            setStatus('success')
            setMessage('Email verified! Please log in to continue.')

            setTimeout(() => {
              router.push('/login?verified=true')
            }, 2000)
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2Icon className="w-12 h-12 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircleIcon className="w-12 h-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>

          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}

          {status === 'success' && (
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
