import { createClient } from '@/lib/supabase/client'

export async function registerFile(
  fileId: string,
  fileName: string,
  description: string,
  functionality: string,
  connection: string
) {
  const supabase = createClient()
  
  const { error } = await supabase.rpc('register_file', {
    file_id_input: fileId,
    file_name_input: fileName,
    description_input: description,
    functionality_input: functionality,
    connection_input: connection
  })

  if (error) {
    console.error('Failed to register file:', error)
    throw error
  }
}

export async function getFileRegistry() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('file_registry')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get file registry:', error)
    throw error
  }

  return data
}

export async function getFileById(fileId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('file_registry')
    .select('*')
    .eq('file_id', fileId)
    .single()

  if (error) {
    console.error('Failed to get file:', error)
    throw error
  }

  return data
}

export function generateFileId(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase()
}
