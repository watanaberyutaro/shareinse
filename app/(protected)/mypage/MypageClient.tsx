'use client'

import { useState } from 'react'
import { User, Camera, Mail, Building2, TrendingUp, Target, DollarSign, Award } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  email: string
}

interface Profile {
  id: string
  display_name: string
  email: string
  role: string
  department_id: string | null
  created_at: string
  updated_at: string
}

interface SalesHistory {
  month: string
  sales: number
  profit: number
  count: number
}

interface Assignment {
  id: string
  project_name: string
  project_location: string
  work_month: string
  staff_name: string
  sales_amount: number
  profit_amount: number
}

interface Target {
  id: string
  sales_target: number | null
  profit_target: number | null
  assignment_target: number | null
}

interface MypageClientProps {
  user: User
  profile: Profile | null
  salesHistory: SalesHistory[]
  currentAssignments: Assignment[]
  target: Target | null
}

export default function MypageClient({
  user,
  profile,
  salesHistory,
  currentAssignments,
  target
}: MypageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // グラフデータの準備
  const chartData = salesHistory.map(record => ({
    month: format(new Date(record.record_month), 'M月', { locale: ja }),
    sales: record.total_sales || 0,
    profit: record.total_profit || 0,
    projectProfit: record.project_profit || 0,
    staffProfit: record.staff_profit || 0,
  }))

  // 当月のサマリー計算
  const currentMonthData = salesHistory[salesHistory.length - 1] || {
    total_sales: 0,
    total_profit: 0,
    project_profit: 0,
    staff_profit: 0,
    assignment_count: 0,
    gross_margin_rate: 0,
  }

  const achievementRate = target?.sales_target 
    ? Math.round((currentMonthData.total_sales / target.sales_target) * 100)
    : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(value)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      // 既存のアバターを削除
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${oldPath}`])
      }

      // 新しいアバターをアップロード
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // プロファイルを更新
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      router.refresh()
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('アバターのアップロードに失敗しました')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)

      if (error) throw error

      setIsEditingProfile(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('プロファイルの更新に失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">マイページ</h1>
        <p className="text-gray-600 mt-2">プロファイルと売上実績</p>
      </div>

      {/* プロファイルセクション */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            {isEditingProfile ? (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-2xl font-bold px-2 py-1 border border-gray-300 rounded"
                />
                <button
                  onClick={handleProfileUpdate}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setDisplayName(profile?.display_name || '')
                    setIsEditingProfile(false)
                  }}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{profile?.display_name}</h2>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  編集
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">メール:</span>
                <span className="text-gray-800">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">部署:</span>
                <span className="text-gray-800">{profile?.departments?.name || '未分類'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">役職:</span>
                <span className="text-gray-800">
                  {profile?.role === 'admin' ? '管理者' : 
                   profile?.role === 'leader' ? '隊長' : 'メンバー'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 当月サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今月の売上</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(currentMonthData.total_sales)}
              </p>
              {target?.sales_target && (
                <p className="text-xs text-gray-500 mt-1">
                  目標: {formatCurrency(target.sales_target)}
                </p>
              )}
            </div>
            <DollarSign className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今月の利益</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(currentMonthData.total_profit)}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                <div>案件: {formatCurrency(currentMonthData.project_profit)}</div>
                <div>人材: {formatCurrency(currentMonthData.staff_profit)}</div>
              </div>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">達成率</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {achievementRate}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(achievementRate, 100)}%` }}
                />
              </div>
            </div>
            <Target className="h-10 w-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">粗利率</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {currentMonthData.gross_margin_rate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                案件数: {currentMonthData.assignment_count}件
              </p>
            </div>
            <Award className="h-10 w-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">売上推移</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">利益内訳</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="projectProfit" stackId="a" fill="#10B981" name="案件担当" />
              <Bar dataKey="staffProfit" stackId="a" fill="#6366F1" name="人材担当" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 当月の案件詳細 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">今月の案件詳細</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">案件名</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">役割</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">スタッフ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">稼働日数</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">売上</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">利益（自分）</th>
              </tr>
            </thead>
            <tbody>
              {currentAssignments.map((assignment) => {
                const isProjectManager = assignment.project_manager_id === user.id
                const isStaffManager = assignment.staff_manager_id === user.id
                const workDays = assignment.project_type === 'continuous' 
                  ? assignment.work_days 
                  : assignment.work_dates?.length || 0
                const fullRevenue = assignment.daily_rate * workDays
                const profit = (assignment.daily_rate - assignment.cost_rate) * workDays
                
                // 自分の売上と利益を計算
                let myRevenue = 0
                let myProfit = 0
                
                if (isProjectManager && isStaffManager) {
                  // 両方担当: 売上100%、利益100%
                  myRevenue = fullRevenue
                  myProfit = profit
                } else if (isProjectManager || isStaffManager) {
                  // 片方のみ担当: 売上50%、利益50%
                  myRevenue = fullRevenue * 0.5
                  myProfit = profit * 0.5
                }

                return (
                  <tr key={assignment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{assignment.project_name}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        isProjectManager && isStaffManager ? 'bg-purple-100 text-purple-700' :
                        isProjectManager ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {isProjectManager && isStaffManager ? '両方' :
                         isProjectManager ? '案件担当' : '人材担当'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{assignment.staff_name}</td>
                    <td className="py-3 px-4 text-sm">{workDays}日</td>
                    <td className="py-3 px-4 text-sm text-right">{formatCurrency(myRevenue)}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                      {formatCurrency(myProfit)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}