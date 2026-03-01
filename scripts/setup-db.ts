import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQL() {
  const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf-8')
  
  // Split by semicolons to get individual statements
  const statements = sql.split(';').filter(s => s.trim().length > 0)
  
  console.log(`Executing ${statements.length} SQL statements...`)
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim()
    if (statement.length === 0) continue
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      if (error) {
        console.log(`Statement ${i + 1}:`, statement.substring(0, 50) + '...')
        console.error('Error:', error.message)
      } else {
        console.log(`Statement ${i + 1}: Success`)
      }
    } catch (e: any) {
      console.log(`Statement ${i + 1}:`, statement.substring(0, 50) + '...')
      console.error('Exception:', e.message)
    }
  }
}

executeSQL()
  .then(() => console.log('Done!'))
  .catch(console.error)
