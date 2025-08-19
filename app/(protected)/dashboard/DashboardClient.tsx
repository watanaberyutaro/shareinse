'use client'

import { TrendingUp, Users, DollarSign, Target, Calendar, Building2, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface DashboardClientProps {
  profile: any
  companyStats: {
    totalSales: number
    totalProfit: number
    totalAssignments: number
    grossMarginRate: number
  }
  companyTarget?: {
    sales_target: number
    profit_target: number
    assignment_target: number
  }
  departmentData: Array<{
    id: string
    name: string
    sales: number
    profit: number
    assignmentCount: number
    grossMarginRate: number
    salesTarget?: number
    profitTarget?: number
    assignmentTarget?: number
    salesAchievement?: number
    profitAchievement?: number
    assignmentAchievement?: number
  }>
  personalStats: {
    totalSales: number
    totalProfit: number
    assignmentCount: number
  }
  personalTarget?: {
    sales_target: number
    profit_target: number
    assignment_target: number
  }
  recentAssignments: any[]
  monthlyData: Array<{
    month: string
    sales: number
    profit: number
  }>
}

export default function DashboardClient({
  profile,
  companyStats,
  companyTarget,
  departmentData,
  personalStats,
  personalTarget,
  recentAssignments,
  monthlyData
}: DashboardClientProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatCompactCurrency = (value: number) => {
    if (value >= 100000000) {
      return `¥${(value / 100000000).toFixed(1)}億`
    } else if (value >= 10000000) {
      return `¥${(value / 10000000).toFixed(1)}千万`
    } else if (value >= 10000) {
      return `¥${(value / 10000).toFixed(0)}万`
    }
    return formatCurrency(value)
  }

  // 部署別データのチャート用色設定
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  // 達成率を計算する関数
  const calculateAchievement = (actual: number, target: number) => {
    if (target <= 0) return 0
    return Math.min(Math.round((actual / target) * 100), 999)
  }

  // 達成率の色を取得する関数
  const getAchievementColor = (rate: number) => {
    if (rate >= 100) return 'text-green-600'
    if (rate >= 80) return 'text-blue-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // 達成率のバー色を取得する関数
  const getAchievementBarColor = (rate: number) => {
    if (rate >= 100) return 'bg-green-500'
    if (rate >= 80) return 'bg-blue-500'
    if (rate >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">
          {format(new Date(), 'yyyy年M月', { locale: ja })}の全社実績
        </p>
      </div>

      {/* 全社目標と実績 */}
      {companyTarget && companyTarget.sales_target > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            全社目標達成状況
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 売上 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-gray-600">売上</span>
                <span className={`text-2xl font-bold ${getAchievementColor(calculateAchievement(companyStats.totalSales, companyTarget.sales_target))}`}>
                  {calculateAchievement(companyStats.totalSales, companyTarget.sales_target)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full ${getAchievementBarColor(calculateAchievement(companyStats.totalSales, companyTarget.sales_target))}`}
                  style={{ width: `${Math.min(calculateAchievement(companyStats.totalSales, companyTarget.sales_target), 100)}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                実績: {formatCompactCurrency(companyStats.totalSales)}
              </div>
              <div className="text-sm text-gray-500">
                目標: {formatCompactCurrency(companyTarget.sales_target)}
              </div>
            </div>
            
            {/* 利益 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-gray-600">利益</span>
                <span className={`text-2xl font-bold ${getAchievementColor(calculateAchievement(companyStats.totalProfit, companyTarget.profit_target))}`}>
                  {calculateAchievement(companyStats.totalProfit, companyTarget.profit_target)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full ${getAchievementBarColor(calculateAchievement(companyStats.totalProfit, companyTarget.profit_target))}`}
                  style={{ width: `${Math.min(calculateAchievement(companyStats.totalProfit, companyTarget.profit_target), 100)}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                実績: {formatCompactCurrency(companyStats.totalProfit)}
              </div>
              <div className="text-sm text-gray-500">
                目標: {formatCompactCurrency(companyTarget.profit_target)}
              </div>
            </div>
            
            {/* アサイン数 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-gray-600">アサイン数</span>
                <span className={`text-2xl font-bold ${getAchievementColor(calculateAchievement(companyStats.totalAssignments, companyTarget.assignment_target))}`}>
                  {calculateAchievement(companyStats.totalAssignments, companyTarget.assignment_target)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full ${getAchievementBarColor(calculateAchievement(companyStats.totalAssignments, companyTarget.assignment_target))}`}
                  style={{ width: `${Math.min(calculateAchievement(companyStats.totalAssignments, companyTarget.assignment_target), 100)}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                実績: {companyStats.totalAssignments}件
              </div>
              <div className="text-sm text-gray-500">
                目標: {companyTarget.assignment_target}件
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 全社KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">全社売上</p>
              <p className="text-2xl font-bold mt-2">
                {formatCompactCurrency(companyStats.totalSales)}
              </p>
              {companyTarget && companyTarget.sales_target > 0 && (
                <p className="text-xs opacity-75 mt-1">
                  目標比: {calculateAchievement(companyStats.totalSales, companyTarget.sales_target)}%
                </p>
              )}
            </div>
            <DollarSign className="h-10 w-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">全社利益</p>
              <p className="text-2xl font-bold mt-2">
                {formatCompactCurrency(companyStats.totalProfit)}
              </p>
              {companyTarget && companyTarget.profit_target > 0 && (
                <p className="text-xs opacity-75 mt-1">
                  目標比: {calculateAchievement(companyStats.totalProfit, companyTarget.profit_target)}%
                </p>
              )}
            </div>
            <TrendingUp className="h-10 w-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">全社アサイン数</p>
              <p className="text-2xl font-bold mt-2">
                {companyStats.totalAssignments} 件
              </p>
              {companyTarget && companyTarget.assignment_target > 0 && (
                <p className="text-xs opacity-75 mt-1">
                  目標比: {calculateAchievement(companyStats.totalAssignments, companyTarget.assignment_target)}%
                </p>
              )}
            </div>
            <Users className="h-10 w-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">全社粗利率</p>
              <p className="text-2xl font-bold mt-2">
                {companyStats.grossMarginRate}%
              </p>
            </div>
            <Target className="h-10 w-10 opacity-80" />
          </div>
        </div>
      </div>

      {/* 部署別実績 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          部署別実績
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">部署</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">売上</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">利益</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">粗利率</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">アサイン数</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept, index) => (
                <tr key={dept.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="font-medium">{formatCompactCurrency(dept.sales)}</div>
                    {dept.salesTarget > 0 && (
                      <div className={`text-xs ${getAchievementColor(dept.salesAchievement || 0)}`}>
                        達成率: {dept.salesAchievement}%
                      </div>
                    )}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="text-green-600 font-medium">{formatCompactCurrency(dept.profit)}</div>
                    {dept.profitTarget > 0 && (
                      <div className={`text-xs ${getAchievementColor(dept.profitAchievement || 0)}`}>
                        達成率: {dept.profitAchievement}%
                      </div>
                    )}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      dept.grossMarginRate >= 30 ? 'bg-green-100 text-green-700' :
                      dept.grossMarginRate >= 20 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {dept.grossMarginRate}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">{dept.assignmentCount}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-50">
                <td className="py-3 px-4">合計</td>
                <td className="text-right py-3 px-4">{formatCompactCurrency(companyStats.totalSales)}</td>
                <td className="text-right py-3 px-4 text-green-600">{formatCompactCurrency(companyStats.totalProfit)}</td>
                <td className="text-right py-3 px-4">{companyStats.grossMarginRate}%</td>
                <td className="text-right py-3 px-4">{companyStats.totalAssignments}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月次推移グラフ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">全社売上・利益推移</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
              />
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0' }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="売上"
                dot={{ fill: '#3B82F6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                strokeWidth={2}
                name="利益"
                dot={{ fill: '#10B981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 部署別売上構成比 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">部署別売上構成</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData.filter(d => d.sales > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="sales"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 個人実績と目標 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="h-5 w-5" />
          あなたの今月の実績
        </h2>
        
        {/* 個人目標がある場合は達成率を表示 */}
        {personalTarget && personalTarget.sales_target > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">個人目標達成状況</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-gray-600">売上</span>
                  <span className={`text-lg font-bold ${getAchievementColor(calculateAchievement(personalStats.totalSales, personalTarget.sales_target))}`}>
                    {calculateAchievement(personalStats.totalSales, personalTarget.sales_target)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getAchievementBarColor(calculateAchievement(personalStats.totalSales, personalTarget.sales_target))}`}
                    style={{ width: `${Math.min(calculateAchievement(personalStats.totalSales, personalTarget.sales_target), 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目標: {formatCompactCurrency(personalTarget.sales_target)}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-gray-600">利益</span>
                  <span className={`text-lg font-bold ${getAchievementColor(calculateAchievement(personalStats.totalProfit, personalTarget.profit_target))}`}>
                    {calculateAchievement(personalStats.totalProfit, personalTarget.profit_target)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getAchievementBarColor(calculateAchievement(personalStats.totalProfit, personalTarget.profit_target))}`}
                    style={{ width: `${Math.min(calculateAchievement(personalStats.totalProfit, personalTarget.profit_target), 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目標: {formatCompactCurrency(personalTarget.profit_target)}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-gray-600">アサイン</span>
                  <span className={`text-lg font-bold ${getAchievementColor(calculateAchievement(personalStats.assignmentCount, personalTarget.assignment_target))}`}>
                    {calculateAchievement(personalStats.assignmentCount, personalTarget.assignment_target)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getAchievementBarColor(calculateAchievement(personalStats.assignmentCount, personalTarget.assignment_target))}`}
                    style={{ width: `${Math.min(calculateAchievement(personalStats.assignmentCount, personalTarget.assignment_target), 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目標: {personalTarget.assignment_target}件
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">売上貢献</p>
            <p className="text-xl font-bold text-gray-800 mt-1">
              {formatCurrency(personalStats.totalSales)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              全社比: {companyStats.totalSales > 0 ? Math.round((personalStats.totalSales / companyStats.totalSales) * 100) : 0}%
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">利益貢献</p>
            <p className="text-xl font-bold text-green-600 mt-1">
              {formatCurrency(personalStats.totalProfit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              全社比: {companyStats.totalProfit > 0 ? Math.round((personalStats.totalProfit / companyStats.totalProfit) * 100) : 0}%
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">担当アサイン</p>
            <p className="text-xl font-bold text-gray-800 mt-1">
              {personalStats.assignmentCount} 件
            </p>
            <p className="text-xs text-gray-500 mt-1">
              全社比: {companyStats.totalAssignments > 0 ? Math.round((personalStats.assignmentCount / companyStats.totalAssignments) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* 最近のアサイン */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">最近のアサイン（全社）</h2>
        <div className="space-y-3">
          {recentAssignments.map((assignment) => (
            <div key={assignment.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{assignment.project_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {assignment.staff_name} / {assignment.project_location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    担当: {assignment.project_manager?.display_name || '-'} / {assignment.staff_manager?.display_name || '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {formatCurrency(assignment.daily_rate * (assignment.work_days || 0))}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(assignment.work_month), 'yyyy年M月', { locale: ja })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}