import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AssignmentsClient from './AssignmentsClient'

export default async function AssignmentsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // プロファイル取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 営業スタッフ一覧取得（プルダウン用）
  const { data: staffList } = await supabase
    .from('profiles')
    .select('id, display_name')
    .order('display_name')

  // 企業一覧取得
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('name')

  // アサイン一覧取得
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      *,
      project_manager:profiles!assignments_project_manager_id_fkey(display_name),
      staff_manager:profiles!assignments_staff_manager_id_fkey(display_name),
      client_company:companies!assignments_client_company_id_fkey(name),
      vendor_company:companies!assignments_vendor_company_id_fkey(name)
    `)
    .order('work_month', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <AssignmentsClient
      assignments={assignments || []}
      staffList={staffList || []}
      companies={companies || []}
      currentUserId={user.id}
      userRole={profile?.role || 'member'}
    />
  )
}