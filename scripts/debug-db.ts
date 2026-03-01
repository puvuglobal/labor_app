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

async function testAndCreate() {
  console.log('1. Testing database connection...')
  
  // Test if tables exist
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .limit(5)
  
  if (tableError) {
    console.log('Error fetching tables:', tableError.message)
  } else {
    console.log('Tables found:', tables?.length || 0)
    console.log(tables?.map(t => t.table_name).join(', '))
  }

  console.log('\n2. Checking if generate_hex_id function exists...')
  const { data: funcData, error: funcError } = await supabase.rpc('generate_hex_id', { length: 5 })
  
  if (funcError) {
    console.log('Function error:', funcError.message)
  } else {
    console.log('Function works! Result:', funcData)
  }
  
  console.log('\n3. Trying to create user directly via SQL...')
  
  // Try to create user with raw SQL
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'testdirect@test.com',
    password: 'TestPass123!@#',
    email_confirm: true
  })
  
  if (userError) {
    console.log('User creation error:', userError.message)
  } else {
    console.log('User created! ID:', userData.user?.id)
  }
}

testAndCreate()
