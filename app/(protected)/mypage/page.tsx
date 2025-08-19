import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MypageClient from './MypageClient'

export default async function MypagePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // プロファイル取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, departments(name)')
    .eq('id', user.id)
    .single()

  // 当月と過去12ヶ月の売上データを取得（アサインデータから集計）
  const currentDate = new Date()
  const salesHistory = []
  
  // デバッグ: ユーザーIDを確認
  console.log('Current user ID:', user.id)
  console.log('User email:', user.email)
  
  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    // UTCタイムゾーンで日付を作成
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const targetMonth = `${year}-${month}-01`
    
    const { data: monthAssignments, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('work_month', targetMonth)
      .or(`project_manager_id.eq.${user.id},staff_manager_id.eq.${user.id}`)
    
    // デバッグ: データ取得結果を確認
    if (i === 0) { // 当月のみログ出力
      console.log('Current month:', targetMonth)
      console.log('Assignments found:', monthAssignments?.length || 0)
      console.log('Query error:', error)
      if (monthAssignments && monthAssignments.length > 0) {
        console.log('Sample assignment:', monthAssignments[0])
      }
    }
    
    let totalSales = 0
    let totalProfit = 0
    let projectProfit = 0
    let staffProfit = 0
    let assignmentCount = 0
    
    if (monthAssignments && monthAssignments.length > 0) {
      monthAssignments.forEach(assignment => {
        const workDays = assignment.project_type === 'continuous' 
          ? (assignment.work_days || 0)
          : (assignment.work_dates?.length || 0)
        
        const sales = assignment.daily_rate * workDays
        const cost = assignment.cost_rate * workDays
        const profit = sales - cost
        
        const isProjectManager = assignment.project_manager_id === user.id
        const isStaffManager = assignment.staff_manager_id === user.id
        
        // 売上と利益の配分計算
        if (isProjectManager && isStaffManager) {
          // 両方担当: 売上100%、利益は役割ごとに50%ずつ
          totalSales += sales
          projectProfit += profit * 0.5
          staffProfit += profit * 0.5
          assignmentCount++
        } else if (isProjectManager) {
          // 案件担当のみ: 売上50%、利益50%
          totalSales += sales * 0.5
          projectProfit += profit * 0.5
          assignmentCount++
        } else if (isStaffManager) {
          // 人材担当のみ: 売上50%、利益50%
          totalSales += sales * 0.5
          staffProfit += profit * 0.5
          assignmentCount++
        }
      })
      
      totalProfit = projectProfit + staffProfit
    }
    
    salesHistory.push({
      record_month: targetMonth,
      total_sales: totalSales,
      total_profit: totalProfit,
      project_profit: projectProfit,
      staff_profit: staffProfit,
      assignment_count: assignmentCount,
      gross_margin_rate: totalSales > 0 ? Math.round((totalProfit / totalSales) * 100) : 0
    })
  }

  // 当月の詳細アサインデータを取得
  const currentYear = currentDate.getFullYear()
  const currentMonthNum = String(currentDate.getMonth() + 1).padStart(2, '0')
  const currentMonth = `${currentYear}-${currentMonthNum}-01`
  
  console.log('Fetching assignments for current month:', currentMonth)
  
  const { data: currentAssignments, error: currentError } = await supabase
    .from('assignments')
    .select(`
      *,
      client_company:companies!assignments_client_company_id_fkey(name),
      vendor_company:companies!assignments_vendor_company_id_fkey(name)
    `)
    .eq('work_month', currentMonth)
    .or(`project_manager_id.eq.${user.id},staff_manager_id.eq.${user.id}`)
  
  if (currentError) {
    console.error('Error fetching current assignments:', currentError)
  } else {
    console.log('Current assignments count:', currentAssignments?.length || 0)
  }

  // 目標値を取得
  const { data: target } = await supabase
    .from('targets')
    .select('*')
    .eq('target_type', 'individual')
    .eq('target_id', user.id)
    .eq('target_month', currentMonth)
    .single()

  return (
    <MypageClient
      user={user}
      profile={profile}
      salesHistory={salesHistory || []}
      currentAssignments={currentAssignments || []}
      target={target}
    />
  )
}