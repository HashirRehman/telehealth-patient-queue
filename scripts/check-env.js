#!/usr/bin/env node

/**
 * Environment Setup Checker
 * Verifies that all required environment variables are set for seeding
 */

console.log('🔍 Checking environment setup for Prisma seeding...\n')

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
]

const optionalVars = ['SUPABASE_SERVICE_ROLE_KEY']

let hasErrors = false

// Check required variables
console.log('✅ Required Variables:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`   ✓ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`   ❌ ${varName}: MISSING`)
    hasErrors = true
  }
})

console.log('\n🔧 Optional Variables:')
optionalVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`   ✓ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`   ⚠️  ${varName}: MISSING (needed for creating auth users)`)
  }
})

if (hasErrors) {
  console.log(
    '\n❌ Setup incomplete! Please fix the missing variables in .env.local'
  )
  console.log('\n📝 To fix:')
  console.log('1. Copy .env.example to .env.local')
  console.log('2. Fill in your Supabase credentials from:')
  console.log(
    '   https://supabase.com/dashboard/project/[your-project]/settings/api'
  )
  process.exit(1)
}

const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
if (hasServiceRole) {
  console.log('\n🎉 Environment setup complete! You can run:')
  console.log('   npm run db:seed')
  console.log('\n✅ This will create both auth users AND patient records.')
} else {
  console.log('\n⚠️  Partial setup - missing SUPABASE_SERVICE_ROLE_KEY')
  console.log('\n🔧 Without service role key:')
  console.log('   ✓ Patient records will be created')
  console.log('   ❌ Auth users will NOT be created')
  console.log(
    '\n🔑 To create auth users, add SUPABASE_SERVICE_ROLE_KEY to .env.local'
  )
  console.log('   Find it at: Settings → API → service_role key')
}
