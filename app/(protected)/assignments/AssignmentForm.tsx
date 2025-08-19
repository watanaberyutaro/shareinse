'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, MapPin, Building2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface AssignmentFormProps {
  assignment?: any
  staffList: any[]
  companies: any[]
  currentUserId: string
  onClose: () => void
  onSave: () => void
}

export default function AssignmentForm({
  assignment,
  staffList,
  companies,
  currentUserId,
  onClose,
  onSave
}: AssignmentFormProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    project_name: '',
    project_location: '',
    project_type: 'continuous' as 'spot' | 'continuous',
    staff_name: '',
    staff_company: '',
    client_company_id: '',
    vendor_company_id: '',
    daily_rate: 0,
    cost_rate: 0,
    work_month: format(new Date(), 'yyyy-MM'),
    work_days: 0,
    work_dates: [] as string[],
    project_manager_id: '',
    staff_manager_id: '',
  })

  // スポット案件用の選択された日付
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (assignment) {
      console.log('Loading assignment for edit:', assignment)
      
      // work_monthの処理 - YYYY-MM-DD形式からYYYY-MM形式に変換
      let workMonth = format(new Date(), 'yyyy-MM')
      if (assignment.work_month) {
        // YYYY-MM-DD または YYYY-MM 形式の両方に対応
        if (assignment.work_month.length === 10) {
          // YYYY-MM-DD形式の場合
          workMonth = assignment.work_month.substring(0, 7)
        } else if (assignment.work_month.length === 7) {
          // YYYY-MM形式の場合
          workMonth = assignment.work_month
        }
      }
      
      // 編集モードの場合、既存データをフォームにセット
      setFormData({
        project_name: assignment.project_name || '',
        project_location: assignment.project_location || '',
        project_type: assignment.project_type || 'continuous',
        staff_name: assignment.staff_name || '',
        staff_company: assignment.staff_company || '',
        client_company_id: assignment.client_company_id || '',
        vendor_company_id: assignment.vendor_company_id || '',
        daily_rate: assignment.daily_rate || 0,
        cost_rate: assignment.cost_rate || 0,
        work_month: workMonth,
        work_days: assignment.work_days || 0,
        work_dates: assignment.work_dates || [],
        project_manager_id: assignment.project_manager_id || '',
        staff_manager_id: assignment.staff_manager_id || '',
      })
      
      // スポット案件の日付を設定
      if (assignment.work_dates && assignment.work_dates.length > 0) {
        console.log('Setting selected dates:', assignment.work_dates)
        setSelectedDates(new Set(assignment.work_dates))
      }
    } else {
      // 新規作成モードの場合、デフォルト値を設定
      setFormData({
        project_name: '',
        project_location: '',
        project_type: 'continuous',
        staff_name: '',
        staff_company: '',
        client_company_id: '',
        vendor_company_id: '',
        daily_rate: 0,
        cost_rate: 0,
        work_month: format(new Date(), 'yyyy-MM'),
        work_days: 0,
        work_dates: [],
        project_manager_id: '',
        staff_manager_id: '',
      })
      setSelectedDates(new Set())
    }
  }, [assignment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // バリデーション
      if (formData.project_type === 'spot' && selectedDates.size === 0) {
        alert('スポット案件の場合は稼働日を選択してください')
        setIsLoading(false)
        return
      }

      if (formData.project_type === 'continuous' && formData.work_days <= 0) {
        alert('継続案件の場合は稼働日数を入力してください')
        setIsLoading(false)
        return
      }

      // 日付フォーマットの確認と修正
      const workMonth = formData.work_month.includes('-01') 
        ? formData.work_month 
        : formData.work_month + '-01'

      const data = {
        project_name: formData.project_name.trim(),
        project_location: formData.project_location.trim(),
        project_type: formData.project_type,
        staff_name: formData.staff_name.trim(),
        staff_company: formData.staff_company?.trim() || null,
        client_company_id: formData.client_company_id || null,
        vendor_company_id: formData.vendor_company_id || null,
        daily_rate: Number(formData.daily_rate) || 0,
        cost_rate: Number(formData.cost_rate) || 0,
        work_month: workMonth,
        work_dates: formData.project_type === 'spot' ? Array.from(selectedDates).sort() : null,
        work_days: formData.project_type === 'continuous' ? Number(formData.work_days) : null,
        project_manager_id: formData.project_manager_id || null,
        staff_manager_id: formData.staff_manager_id || null,
      }

      console.log('Submitting data:', data)

      if (assignment) {
        // 更新
        const { error } = await supabase
          .from('assignments')
          .update({
            ...data,
            updated_by: currentUserId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', assignment.id)

        if (error) {
          console.error('Update error:', error)
          throw error
        }
        console.log('Assignment updated successfully')
      } else {
        // 新規作成
        const { error } = await supabase
          .from('assignments')
          .insert({
            ...data,
            created_by: currentUserId,
            created_at: new Date().toISOString(),
          })

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        console.log('Assignment created successfully')
      }

      onSave()
    } catch (error: any) {
      console.error('Error saving assignment:', error)
      alert(`保存に失敗しました: ${error.message || '不明なエラー'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // カレンダーの日付を生成
  const generateCalendarDates = () => {
    const year = parseInt(formData.work_month.split('-')[0])
    const month = parseInt(formData.work_month.split('-')[1]) - 1
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const dates = []

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d))
    }

    return dates
  }

  const toggleDate = (date: string) => {
    const newDates = new Set(selectedDates)
    if (newDates.has(date)) {
      newDates.delete(date)
    } else {
      newDates.add(date)
    }
    setSelectedDates(newDates)
    // work_datesも同期的に更新
    setFormData(prev => ({
      ...prev,
      work_dates: Array.from(newDates).sort()
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center md:p-4 z-50">
      <div className="bg-white rounded-t-2xl md:rounded-lg w-full md:max-w-4xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-semibold">
            {assignment ? 'アサイン編集' : '新規アサイン登録'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 md:h-6 w-5 md:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* 基本情報 */}
          <div>
            <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件場所 *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    required
                    value={formData.project_location}
                    onChange={(e) => setFormData({ ...formData, project_location: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件種別 *
                </label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="continuous">継続</option>
                  <option value="spot">スポット</option>
                </select>
              </div>
            </div>
          </div>

          {/* スタッフ情報 */}
          <div>
            <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">スタッフ情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スタッフ名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.staff_name}
                  onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属会社
                </label>
                <input
                  type="text"
                  value={formData.staff_company}
                  onChange={(e) => setFormData({ ...formData, staff_company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* 企業情報 */}
          <div>
            <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">企業情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件元企業
                </label>
                <select
                  value={formData.client_company_id}
                  onChange={(e) => setFormData({ ...formData, client_company_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">選択してください</option>
                  {companies.filter(c => c.company_type === 'client' || c.company_type === 'both').map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  人財元企業
                </label>
                <select
                  value={formData.vendor_company_id}
                  onChange={(e) => setFormData({ ...formData, vendor_company_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">選択してください</option>
                  {companies.filter(c => c.company_type === 'vendor' || c.company_type === 'both').map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 金額情報 */}
          <div>
            <h3 className="text-lg font-medium mb-4">金額情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  稼働単価（円/日） *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    required
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({ ...formData, daily_rate: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  卸単価（円/日） *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    required
                    value={formData.cost_rate}
                    onChange={(e) => setFormData({ ...formData, cost_rate: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 稼働情報 */}
          <div>
            <h3 className="text-lg font-medium mb-4">稼働情報</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                稼働月 *
              </label>
              <input
                type="month"
                required
                value={formData.work_month}
                onChange={(e) => setFormData({ ...formData, work_month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {formData.project_type === 'continuous' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  稼働日数 *
                </label>
                <input
                  type="number"
                  required
                  value={formData.work_days}
                  onChange={(e) => setFormData({ ...formData, work_days: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  稼働日選択（{selectedDates.size}日選択中）
                </label>
                <div className="grid grid-cols-7 gap-1 p-4 border border-gray-300 rounded-lg">
                  {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 pb-2">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDates().map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const isSelected = selectedDates.has(dateStr)
                    const dayOfWeek = date.getDay()
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                    
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => toggleDate(dateStr)}
                        className={`
                          p-2 text-sm rounded transition
                          ${isSelected 
                            ? 'bg-blue-500 text-white' 
                            : isWeekend
                              ? 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                              : 'hover:bg-gray-100'
                          }
                        `}
                        style={{
                          gridColumnStart: date.getDate() === 1 ? dayOfWeek + 1 : undefined
                        }}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 担当者情報 */}
          <div>
            <h3 className="text-lg font-medium mb-4">担当者情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件担当者
                </label>
                <select
                  value={formData.project_manager_id}
                  onChange={(e) => setFormData({ ...formData, project_manager_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">選択してください</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.display_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  人材担当者
                </label>
                <select
                  value={formData.staff_manager_id}
                  onChange={(e) => setFormData({ ...formData, staff_manager_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">選択してください</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.display_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}