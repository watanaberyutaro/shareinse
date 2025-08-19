import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // ユーザープロファイルを取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, departments(name)')
    .eq('id', user.id)
    .single()

  // 当月のデータを取得
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().slice(0, 7) + '-01'

  // 全社のアサインデータを取得
  const { data: allAssignments } = await supabase
    .from('assignments')
    .select(`
      *,
      project_manager:profiles!assignments_project_manager_id_fkey(display_name, department_id),
      staff_manager:profiles!assignments_staff_manager_id_fkey(display_name, department_id)
    `)
    .eq('work_month', currentMonth)

  // 全社の売上・利益を計算
  let companyStats = {
    totalSales: 0,
    totalProfit: 0,
    totalAssignments: 0,
    grossMarginRate: 0
  }

  // 部署ごとの売上・利益を集計するためのマップ
  const departmentStats = new Map()

  if (allAssignments) {
    allAssignments.forEach(assignment => {
      const workDays = assignment.project_type === 'continuous' 
        ? (assignment.work_days || 0)
        : (assignment.work_dates?.length || 0)
      
      const sales = assignment.daily_rate * workDays
      const cost = assignment.cost_rate * workDays
      const profit = sales - cost
      
      // 全社統計
      companyStats.totalSales += sales
      companyStats.totalProfit += profit
      companyStats.totalAssignments++
      
      // 部署ごとの集計
      // 案件担当者と人材担当者が同じ部署の場合は100%、異なる部署の場合は50%ずつ
      const projectDeptId = assignment.project_manager?.department_id
      const staffDeptId = assignment.staff_manager?.department_id
      
      if (projectDeptId && staffDeptId && projectDeptId === staffDeptId) {
        // 同じ部署の場合：売上・利益100%を加算
        if (!departmentStats.has(projectDeptId)) {
          departmentStats.set(projectDeptId, {
            id: projectDeptId,
            sales: 0,
            profit: 0,
            assignmentCount: 0
          })
        }
        const dept = departmentStats.get(projectDeptId)
        dept.sales += sales
        dept.profit += profit
        dept.assignmentCount++
      } else {
        // 異なる部署の場合：それぞれ50%ずつ
        if (projectDeptId) {
          if (!departmentStats.has(projectDeptId)) {
            departmentStats.set(projectDeptId, {
              id: projectDeptId,
              sales: 0,
              profit: 0,
              assignmentCount: 0
            })
          }
          const dept = departmentStats.get(projectDeptId)
          dept.sales += sales * 0.5
          dept.profit += profit * 0.5
          dept.assignmentCount++
        }
        
        if (staffDeptId && staffDeptId !== projectDeptId) {
          if (!departmentStats.has(staffDeptId)) {
            departmentStats.set(staffDeptId, {
              id: staffDeptId,
              sales: 0,
              profit: 0,
              assignmentCount: 0
            })
          }
          const dept = departmentStats.get(staffDeptId)
          dept.sales += sales * 0.5
          dept.profit += profit * 0.5
          dept.assignmentCount++
        }
      }
    })
    
    companyStats.grossMarginRate = companyStats.totalSales > 0 
      ? Math.round((companyStats.totalProfit / companyStats.totalSales) * 100)
      : 0
  }

  // 部署情報を取得して部署統計と結合
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  const departmentData = departments?.map(dept => ({
    id: dept.id,
    name: dept.name,
    sales: departmentStats.get(dept.id)?.sales || 0,
    profit: departmentStats.get(dept.id)?.profit || 0,
    assignmentCount: departmentStats.get(dept.id)?.assignmentCount || 0,
    grossMarginRate: departmentStats.get(dept.id)?.sales > 0
      ? Math.round((departmentStats.get(dept.id).profit / departmentStats.get(dept.id).sales) * 100)
      : 0
  })) || []

  // 最近のアサインを取得（全社）
  const { data: recentAssignments } = await supabase
    .from('assignments')
    .select(`
      *,
      project_manager:profiles!assignments_project_manager_id_fkey(display_name),
      staff_manager:profiles!assignments_staff_manager_id_fkey(display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // 過去6ヶ月の月次データを取得（全社）
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() - i)
    const targetMonth = targetDate.toISOString().slice(0, 7) + '-01'
    
    const { data: monthAssignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('work_month', targetMonth)
    
    let monthSales = 0
    let monthProfit = 0
    
    if (monthAssignments) {
      monthAssignments.forEach(assignment => {
        const workDays = assignment.project_type === 'continuous' 
          ? (assignment.work_days || 0)
          : (assignment.work_dates?.length || 0)
        
        const sales = assignment.daily_rate * workDays
        const cost = assignment.cost_rate * workDays
        const profit = sales - cost
        
        monthSales += sales
        monthProfit += profit
      })
    }
    
    monthlyData.push({
      month: targetDate.toLocaleDateString('ja-JP', { month: 'long' }).replace('月', '月'),
      sales: monthSales,
      profit: monthProfit
    })
  }

  // 個人の実績も取得（比較用）
  const { data: userAssignments } = await supabase
    .from('assignments')
    .select('*')
    .eq('work_month', currentMonth)
    .or(`project_manager_id.eq.${user.id},staff_manager_id.eq.${user.id}`)

  let personalStats = {
    totalSales: 0,
    totalProfit: 0,
    assignmentCount: 0
  }

  if (userAssignments) {
    userAssignments.forEach(assignment => {
      const workDays = assignment.project_type === 'continuous' 
        ? (assignment.work_days || 0)
        : (assignment.work_dates?.length || 0)
      
      const sales = assignment.daily_rate * workDays
      const cost = assignment.cost_rate * workDays
      const profit = sales - cost
      
      const isProjectManager = assignment.project_manager_id === user.id
      const isStaffManager = assignment.staff_manager_id === user.id
      
      if (isProjectManager && isStaffManager) {
        personalStats.totalSales += sales
        personalStats.totalProfit += profit
        personalStats.assignmentCount++
      } else if (isProjectManager || isStaffManager) {
        personalStats.totalSales += sales * 0.5
        personalStats.totalProfit += profit * 0.5
        personalStats.assignmentCount++
      }
    })
  }

  // 目標データを取得
  const { data: targets } = await supabase
    .from('targets')
    .select('*')
    .eq('target_month', currentMonth)

  // 全社目標
  const companyTarget = targets?.find(t => t.target_type === 'company') || {
    sales_target: 0,
    profit_target: 0,
    assignment_target: 0
  }

  // 部署別目標
  const departmentTargets = new Map()
  targets?.filter(t => t.target_type === 'department').forEach(target => {
    departmentTargets.set(target.target_id, {
      sales_target: target.sales_target || 0,
      profit_target: target.profit_target || 0,
      assignment_target: target.assignment_target || 0
    })
  })

  // 個人目標
  const personalTarget = targets?.find(t => 
    t.target_type === 'individual' && t.target_id === user.id
  ) || {
    sales_target: 0,
    profit_target: 0,
    assignment_target: 0
  }

  // 部署データに目標を追加
  const departmentDataWithTargets = departmentData.map(dept => ({
    ...dept,
    salesTarget: departmentTargets.get(dept.id)?.sales_target || 0,
    profitTarget: departmentTargets.get(dept.id)?.profit_target || 0,
    assignmentTarget: departmentTargets.get(dept.id)?.assignment_target || 0,
    salesAchievement: departmentTargets.get(dept.id)?.sales_target > 0
      ? Math.round((dept.sales / departmentTargets.get(dept.id).sales_target) * 100)
      : 0,
    profitAchievement: departmentTargets.get(dept.id)?.profit_target > 0
      ? Math.round((dept.profit / departmentTargets.get(dept.id).profit_target) * 100)
      : 0,
    assignmentAchievement: departmentTargets.get(dept.id)?.assignment_target > 0
      ? Math.round((dept.assignmentCount / departmentTargets.get(dept.id).assignment_target) * 100)
      : 0
  }))

  return (
    <DashboardClient
      profile={profile}
      companyStats={companyStats}
      companyTarget={companyTarget}
      departmentData={departmentDataWithTargets}
      personalStats={personalStats}
      personalTarget={personalTarget}
      recentAssignments={recentAssignments || []}
      monthlyData={monthlyData}
    />
  )
}