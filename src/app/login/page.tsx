import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'

function LoginFormWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

export default function LoginPage() {
  return <LoginFormWithSuspense />
} 