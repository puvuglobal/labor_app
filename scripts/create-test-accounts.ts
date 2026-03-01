import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgvplccbvauzvyvybhqq.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_ynKmM1Var5ZUqzPW38GxBQ_BYUp7Tp8'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestAccounts() {
  const testAccounts = [
    {
      email: 'admin@test.com',
      password: 'TestPass123!@#',
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User'
    },
    {
      email: 'client@test.com',
      password: 'TestPass123!@#',
      role: 'client',
      first_name: 'VIP Client',
      last_name: 'Company'
    },
    {
      email: 'candidate@test.com',
      password: 'TestPass123!@#',
      role: 'candidate',
      first_name: 'Candidate',
      last_name: 'User'
    }
  ]

  console.log('Creating test accounts...')

  for (const account of testAccounts) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          role: account.role,
          first_name: account.first_name,
          last_name: account.last_name
        }
      })

      if (error) {
        console.log(`Error creating ${account.role}:`, error.message)
      } else {
        console.log(`Created ${account.role} account:`, data.user?.id)
      }
    } catch (e: any) {
      console.log(`Exception for ${account.role}:`, e.message || e)
    }
  }

  console.log('\n=== TEST ACCOUNTS (Email Verified) ===')
  console.log('Admin: admin@test.com / TestPass123!@#')
  console.log('Client: client@test.com / TestPass123!@#')
  console.log('Candidate: candidate@test.com / TestPass123!@#')
}

createTestAccounts()
