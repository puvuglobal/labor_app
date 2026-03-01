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

async function testBasic() {
  console.log('Testing basic auth...')
  
  // Try with minimal user - no metadata
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test' + Date.now() + '@test.com',
    password: 'TestPass123!@#',
    email_confirm: true
  })
  
  console.log('Error:', error?.message || 'None')
  console.log('User:', data?.user?.id || 'None')
}

testBasic()
