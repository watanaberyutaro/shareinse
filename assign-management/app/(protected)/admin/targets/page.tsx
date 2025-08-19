import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import TargetsClient from './TargetsClient'

export default async function TargetsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const { data: targets } = await supabase
    .from('targets')
    .select(`
      *,
      profiles:target_id (
        id,
        display_name,
        email
      ),
      departments:target_id (
        id,
        name
      )
    `)
    .gte('target_month', currentMonth.toISOString())
    .order('target_month', { ascending: false })

  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .order('display_name')

  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')

  return (
    <TargetsClient 
      targets={targets || []} 
      users={users || []}
      departments={departments || []}
    />
  )
}