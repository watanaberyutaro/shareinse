'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Filter, TrendingUp, Users, Building2, Calendar } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

interface ReportsClientProps {
  profile: any
  departments: any[]
  staffList: any[]
  companies: any[]
  canViewAllData: boolean
}

export default function ReportsClient({
  profile,
  departments,
  staffList,
  companies,
  canViewAllData
}: ReportsClientProps) {
  const supabase = createClient()
  const [reportType, setReportType] = useState<'period' | 'customer' | 'staff'>('period')
  const [periodType, setPeriodType] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'))
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedStaff, setSelectedStaff] = useState(canViewAllData ? '' : profile?.id)
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(value)
  }

  useEffect(() => {
    fetchReportData()
  }, [reportType, periodType, selectedPeriod, selectedCustomer, selectedStaff])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      let data = null

      if (reportType === 'period') {
        // 期間別レポート
        const startDate = selectedPeriod + '-01'
        let endDate = startDate

        if (periodType === 'quarter') {
          const quarter = Math.floor((new Date(startDate).getMonth() / 3))
          const year = new Date(startDate).getFullYear()
          const startMonth = quarter * 3
          endDate = new Date(year, startMonth + 3, 0).toISOString().slice(0, 10)
        } else if (periodType === 'year') {
          const year = new Date(startDate).getFullYear()
          endDate = new Date(year, 11, 31).toISOString().slice(0, 10)
        }

        const { data: assignments } = await supabase
          .from('assignments')
          .select(`
            *,
            project_manager:profiles!assignments_project_manager_id_fkey(display_name),
            staff_manager:profiles!assignments_staff_manager_id_fkey(display_name),
            client_company:companies!assignments_client_company_id_fkey(name),
            vendor_company:companies!assignments_vendor_company_id_fkey(name)
          `)
          .gte('work_month', startDate)
          .lte('work_month', endDate)

        data = processperiodData(assignments || [])

      } else if (reportType === 'customer') {
        // 顧客別レポート
        const query = supabase
          .from('assignments')
          .select(`
            *,
            client_company:companies!assignments_client_company_id_fkey(name),
            vendor_company:companies!assignments_vendor_company_id_fkey(name)
          `)

        if (selectedCustomer) {
          query.or(`client_company_id.eq.${selectedCustomer},vendor_company_id.eq.${selectedCustomer}`)
        }

        const { data: assignments } = await query

        data = processCustomerData(assignments || [], companies)

      } else if (reportType === 'staff') {
        // 営業担当者別レポート
        const query = supabase
          .from('assignments')
          .select(`
            *,
            project_manager:profiles!assignments_project_manager_id_fkey(display_name, department_id),
            staff_manager:profiles!assignments_staff_manager_id_fkey(display_name, department_id)
          `)

        if (!canViewAllData || selectedStaff) {
          const staffId = selectedStaff || profile?.id
          query.or(`project_manager_id.eq.${staffId},staff_manager_id.eq.${staffId}`)
        }

        const { data: assignments } = await query

        data = processStaffData(assignments || [], staffList)
      }

      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processperiodData = (assignments: any[]) => {
    const monthlyData: { [key: string]: any } = {}

    assignments.forEach(assignment => {
      const month = assignment.work_month.slice(0, 7)
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          sales: 0,
          profit: 0,
          count: 0,
          clients: new Set(),
        }
      }

      const workDays = assignment.project_type === 'continuous'
        ? assignment.work_days
        : assignment.work_dates?.length || 0
      const revenue = assignment.daily_rate * workDays
      const profit = (assignment.daily_rate - assignment.cost_rate) * workDays

      monthlyData[month].sales += revenue
      monthlyData[month].profit += profit
      monthlyData[month].count++
      if (assignment.client_company?.name) {
        monthlyData[month].clients.add(assignment.client_company.name)
      }
    })

    return Object.values(monthlyData).map(d => ({
      ...d,
      clients: d.clients.size,
      displayMonth: format(new Date(d.month + '-01'), 'yyyy年M月', { locale: ja })
    }))
  }

  const processCustomerData = (assignments: any[], companies: any[]) => {
    const customerData: { [key: string]: any } = {}

    assignments.forEach(assignment => {
      const clientName = assignment.client_company?.name || '未設定'
      const vendorName = assignment.vendor_company?.name || '未設定'

      // クライアント側の集計
      if (!customerData[clientName]) {
        customerData[clientName] = {
          name: clientName,
          type: 'client',
          sales: 0,
          profit: 0,
          count: 0,
        }
      }

      const workDays = assignment.project_type === 'continuous'
        ? assignment.work_days
        : assignment.work_dates?.length || 0
      const revenue = assignment.daily_rate * workDays
      const profit = (assignment.daily_rate - assignment.cost_rate) * workDays

      customerData[clientName].sales += revenue
      customerData[clientName].profit += profit
      customerData[clientName].count++
    })

    return Object.values(customerData).sort((a, b) => b.sales - a.sales)
  }

  const processStaffData = (assignments: any[], staffList: any[]) => {
    const staffData: { [key: string]: any } = {}

    assignments.forEach(assignment => {
      // 案件担当者の集計
      if (assignment.project_manager) {
        const staffId = assignment.project_manager_id
        const staffName = assignment.project_manager.display_name

        if (!staffData[staffId]) {
          staffData[staffId] = {
            id: staffId,
            name: staffName,
            projectSales: 0,
            projectProfit: 0,
            staffSales: 0,
            staffProfit: 0,
            totalSales: 0,
            totalProfit: 0,
            count: 0,
          }
        }

        const workDays = assignment.project_type === 'continuous'
          ? assignment.work_days
          : assignment.work_dates?.length || 0
        const revenue = assignment.daily_rate * workDays
        const profit = (assignment.daily_rate - assignment.cost_rate) * workDays

        staffData[staffId].projectSales += revenue
        staffData[staffId].projectProfit += profit * 0.5
        staffData[staffId].totalSales += revenue
        staffData[staffId].totalProfit += profit * 0.5
        staffData[staffId].count++
      }

      // 人材担当者の集計
      if (assignment.staff_manager && assignment.staff_manager_id !== assignment.project_manager_id) {
        const staffId = assignment.staff_manager_id
        const staffName = assignment.staff_manager.display_name

        if (!staffData[staffId]) {
          staffData[staffId] = {
            id: staffId,
            name: staffName,
            projectSales: 0,
            projectProfit: 0,
            staffSales: 0,
            staffProfit: 0,
            totalSales: 0,
            totalProfit: 0,
            count: 0,
          }
        }

        const workDays = assignment.project_type === 'continuous'
          ? assignment.work_days
          : assignment.work_dates?.length || 0
        const revenue = assignment.daily_rate * workDays
        const profit = (assignment.daily_rate - assignment.cost_rate) * workDays

        staffData[staffId].staffSales += revenue
        staffData[staffId].staffProfit += profit * 0.5
        staffData[staffId].totalSales += revenue
        staffData[staffId].totalProfit += profit * 0.5
        staffData[staffId].count++
      }
    })

    return Object.values(staffData).sort((a, b) => b.totalProfit - a.totalProfit)
  }

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) return

    let csv = ''
    const headers = Object.keys(reportData[0])
    csv += headers.join(',') + '\n'

    reportData.forEach((row: any) => {
      const values = headers.map(header => {
        const value = row[header]
        return typeof value === 'number' ? value : `"${value}"`
      })
      csv += values.join(',') + '\n'
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
    link.click()
  }

  const exportToPDF = () => {
    // PDF出力は実装が複雑なため、ここでは簡易的にwindow.printを使用
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">レポート・分析</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            CSV
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <FileText className="h-5 w-5" />
            PDF
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              レポート種別
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="period">期間別</option>
              <option value="customer">顧客別</option>
              <option value="staff">営業担当者別</option>
            </select>
          </div>

          {reportType === 'period' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  集計単位
                </label>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="month">月次</option>
                  <option value="quarter">四半期</option>
                  <option value="year">年次</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期間
                </label>
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {reportType === 'customer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                企業選択
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'staff' && canViewAllData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                営業担当者
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.display_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* レポート内容 */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">レポートを生成中...</p>
        </div>
      ) : reportData && reportData.length > 0 ? (
        <div className="space-y-6">
          {/* サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総売上</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {formatCurrency(reportData.reduce((sum: number, d: any) => sum + (d.sales || d.totalSales || 0), 0))}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総利益</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {formatCurrency(reportData.reduce((sum: number, d: any) => sum + (d.profit || d.totalProfit || 0), 0))}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">件数</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {reportData.reduce((sum: number, d: any) => sum + (d.count || 0), 0)} 件
                  </p>
                </div>
                <Users className="h-10 w-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* グラフ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportType === 'period' && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">売上推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayMonth" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="sales" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">利益推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayMonth" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {reportType === 'customer' && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">売上構成</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.slice(0, 5)}
                        dataKey="sales"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => entry.name}
                      >
                        {reportData.slice(0, 5).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">上位顧客</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.slice(0, 10)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="sales" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {reportType === 'staff' && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">営業別売上</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="totalSales" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">利益内訳</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="projectProfit" stackId="a" fill="#10B981" name="案件担当" />
                      <Bar dataKey="staffProfit" stackId="a" fill="#6366F1" name="人材担当" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>

          {/* テーブル */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {reportType === 'period' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">期間</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">売上</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">利益</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">件数</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">顧客数</th>
                      </>
                    )}
                    {reportType === 'customer' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">企業名</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">売上</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">利益</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">件数</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">利益率</th>
                      </>
                    )}
                    {reportType === 'staff' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">営業担当者</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">総売上</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">総利益</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">案件担当</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">人材担当</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">件数</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.map((row: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {reportType === 'period' && (
                        <>
                          <td className="px-6 py-4 text-sm">{row.displayMonth}</td>
                          <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.sales)}</td>
                          <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.profit)}</td>
                          <td className="px-6 py-4 text-sm text-right">{row.count}</td>
                          <td className="px-6 py-4 text-sm text-right">{row.clients}</td>
                        </>
                      )}
                      {reportType === 'customer' && (
                        <>
                          <td className="px-6 py-4 text-sm">{row.name}</td>
                          <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.sales)}</td>
                          <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.profit)}</td>
                          <td className="px-6 py-4 text-sm text-right">{row.count}</td>
                          <td className="px-6 py-4 text-sm text-right">
                            {row.sales > 0 ? Math.round((row.profit / row.sales) * 100) : 0}%
                          </td>
                        </>
                      )}
                      {reportType === 'staff' && (
                        <>
                          <td className="px-6 py-4 text-sm">{row.name}</td>
                          <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.totalSales)}</td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                            {formatCurrency(row.totalProfit)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.projectProfit)}</td>
                          <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.staffProfit)}</td>
                          <td className="px-6 py-4 text-sm text-right">{row.count}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">データがありません</p>
        </div>
      )}
    </div>
  )
}