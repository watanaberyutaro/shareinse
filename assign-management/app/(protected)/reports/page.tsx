import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
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

  // 権限チェック（一般メンバーも自分のデータは見れる）
  const canViewAllData = profile?.role === 'admin' || profile?.role === 'leader'

  // 部署一覧取得
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  // 営業スタッフ一覧取得
  const { data: staffList } = await supabase
    .from('profiles')
    .select('id, display_name, department_id')
    .order('display_name')

  // 企業一覧取得
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('name')

  return (
    <ReportsClient
      profile={profile}
      departments={departments || []}
      staffList={staffList || []}
      companies={companies || []}
      canViewAllData={canViewAllData}
    />
  )
}