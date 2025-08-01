import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Initialize Supabase client for auth operations
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '❌ SUPABASE_SERVICE_ROLE_KEY is required for creating auth users'
  )
  console.error('📝 Please add your service role key to .env.local:')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  console.error(
    '🔍 Find it at: Supabase Dashboard → Settings → API → service_role key'
  )
  console.error('')
  console.error(
    '⚠️  Continuing with patient-only seeding (no auth users will be created)...'
  )
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test user credentials that will be documented in README
const TEST_USERS = [
  {
    email: 'admin@telehealth.com',
    password: 'admin123',
    fullName: 'Dr. Sarah Wilson',
    isAdmin: true,
  },
  {
    email: 'provider@telehealth.com',
    password: 'provider123',
    fullName: 'Dr. Michael Chen',
    isAdmin: false,
  },
  {
    email: 'john.doe@email.com',
    password: 'patient123',
    fullName: 'John Doe',
    isAdmin: false,
  },
  {
    email: 'jane.smith@email.com',
    password: 'patient123',
    fullName: 'Jane Smith',
    isAdmin: false,
  },
  {
    email: 'robert.johnson@email.com',
    password: 'patient123',
    fullName: 'Robert Johnson',
    isAdmin: false,
  },
]

const PROVIDERS = [
  'Dr. Sarah Wilson',
  'Dr. Michael Chen',
  'Dr. Emily Rodriguez',
  'Dr. James Thompson',
]
const ROOM_LOCATIONS = [
  'Room A-101',
  'Room A-102',
  'Room B-201',
  'Room B-202',
  'Virtual Room 1',
  'Virtual Room 2',
]
const CHIEF_COMPLAINTS = [
  'Annual checkup',
  'Cold and flu symptoms',
  'Diabetes management',
  'Hypertension follow-up',
  'Mental health consultation',
  'Skin condition',
  'Back pain',
  'Preventive care',
  'Medication review',
  'Lab results discussion',
]

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

function getRandomTime(): Date {
  const hours = Math.floor(Math.random() * 10) + 8 // 8 AM to 6 PM
  const minutes = Math.random() < 0.5 ? 0 : 30 // :00 or :30
  const time = new Date()
  time.setHours(hours, minutes, 0, 0)
  return time
}

async function main() {
  console.log('🌱 Starting database seeding...')

  const createdPatients = []
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  if (hasServiceRoleKey) {
    console.log('👤 Creating Supabase Auth users first...')
  } else {
    console.log(
      '⚠️  Creating patients only (no auth users - service role key missing)'
    )
  }

  // Create Supabase Auth users and corresponding patients
  for (let i = 0; i < TEST_USERS.length; i++) {
    const user = TEST_USERS[i]

    try {
      let authUserId = null

      if (hasServiceRoleKey) {
        console.log(`Creating auth user: ${user.email}`)

        // Create user in Supabase Auth
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // Skip email confirmation for test users
            user_metadata: {
              full_name: user.fullName,
            },
          })

        if (authError) {
          console.error(
            `❌ Error creating auth user ${user.email}:`,
            authError.message
          )

          // If user already exists, try to get their ID
          if (authError.message.includes('already been registered')) {
            console.log(
              `🔍 User ${user.email} already exists, creating patient without user_id...`
            )
          } else {
            throw authError
          }
        } else if (authData.user) {
          authUserId = authData.user.id
          console.log(
            `✅ Created auth user: ${user.email} (ID: ${authData.user.id})`
          )
        }
      } else {
        console.log(
          `Creating patient for: ${user.email} (no auth user - missing service role key)`
        )
      }

      // Create corresponding patient record
      const patient = await prisma.patient.create({
        data: {
          userId: authUserId, // Will be null if no service role key
          fullName: user.fullName,
          email: user.email,
          phone: `+1-555-010${i + 1}`,
          dateOfBirth: new Date(1980 + i * 5, i * 2, 15), // Ages ranging from 44 to 24
          address: `${123 + i * 100} ${['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr'][i]}, City, State ${12340 + i}`,
          emergencyContactName: `Emergency Contact ${i + 1}`,
          emergencyContactPhone: `+1-555-020${i + 1}`,
        },
      })

      createdPatients.push(patient)

      if (authUserId) {
        console.log(`✅ Created patient with user_id: ${patient.fullName}`)
      } else {
        console.log(`⚠️  Created patient without user_id: ${patient.fullName}`)
      }
    } catch (error) {
      console.error(`❌ Error creating user/patient ${user.email}:`, error)
      console.log(`⏭️  Skipping ${user.email} and continuing with others...`)
      continue
    }
  }

  // Create a mix of bookings for each patient
  const bookingStatuses = [
    'pending',
    'confirmed',
    'intake',
    'ready_for_provider',
    'provider',
    'ready_for_discharge',
    'discharged',
    'completed',
    'cancelled',
  ] as const
  const bookingTypes = ['pre_booked', 'online'] as const

  let totalBookings = 0

  for (const patient of createdPatients) {
    // Create 3-5 bookings per patient
    const numberOfBookings = Math.floor(Math.random() * 3) + 3

    for (let j = 0; j < numberOfBookings; j++) {
      const appointmentDate = getRandomDate(
        new Date(2024, 0, 1), // Start of 2024
        new Date(2024, 11, 31) // End of 2024
      )

      const appointmentTime = getRandomTime()

      await prisma.booking.create({
        data: {
          patientId: patient.id,
          appointmentDate,
          appointmentTime,
          bookingType: getRandomElement(bookingTypes),
          status: getRandomElement(bookingStatuses),
          notes: `${getRandomElement(['Routine', 'Follow-up', 'Urgent', 'Consultation'])} appointment for ${patient.fullName}`,
          // Using the first patient's user_id as created_by (if available, otherwise use patient ID)
          createdBy:
            createdPatients[0]?.userId ||
            createdPatients[0]?.id ||
            'seed-admin',
          providerName: getRandomElement(PROVIDERS),
          chiefComplaint: getRandomElement(CHIEF_COMPLAINTS),
          roomLocation: getRandomElement(ROOM_LOCATIONS),
          isAdhoc: Math.random() < 0.3, // 30% chance of being ad-hoc
        },
      })

      totalBookings++
    }

    console.log(
      `✅ Created ${numberOfBookings} bookings for ${patient.fullName}`
    )
  }

  console.log(`\n🎉 Seeding completed successfully!`)
  console.log(`📊 Summary:`)
  console.log(`   • ${createdPatients.length} patients created`)
  console.log(`   • ${totalBookings} bookings created`)
  if (hasServiceRoleKey) {
    console.log(`\n🔑 Test Credentials (Ready to use):`)
    console.log(`   • Admin: admin@telehealth.com / admin123`)
    console.log(`   • Provider: provider@telehealth.com / provider123`)
    console.log(`   • Patient 1: john.doe@email.com / patient123`)
    console.log(`   • Patient 2: jane.smith@email.com / patient123`)
    console.log(`   • Patient 3: robert.johnson@email.com / patient123`)
    console.log(
      `\n✅ These users are now created in Supabase Auth and linked to patient records.`
    )
    console.log(`   You can log in directly with these credentials!`)
  } else {
    console.log(`\n⚠️  Patient records created but NO AUTH USERS were created.`)
    console.log(
      `\n🔧 To create auth users, add SUPABASE_SERVICE_ROLE_KEY to .env.local:`
    )
    console.log(`   1. Go to Supabase Dashboard → Settings → API`)
    console.log(`   2. Copy the 'service_role' key (keep it secret!)`)
    console.log(`   3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key`)
    console.log(`   4. Run: npm run db:seed again`)
    console.log(`\n📧 For now, you can sign up manually with these emails:`)
    console.log(`   • admin@telehealth.com`)
    console.log(`   • provider@telehealth.com`)
    console.log(`   • john.doe@email.com`)
    console.log(`   • jane.smith@email.com`)
    console.log(`   • robert.johnson@email.com`)
  }
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
