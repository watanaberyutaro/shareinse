import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      departments (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  return <UsersClient users={users || []} departments={departments || []} />
}