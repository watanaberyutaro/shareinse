'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import AssignmentForm from './AssignmentForm'
import MobileAssignmentCard from '@/components/ui/MobileAssignmentCard'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Assignment {
  id: string
  project_number: string
  project_name: string
  project_location: string
  assignment_type?: 'spot' | 'continuous'
  project_type?: 'spot' | 'continuous'  // 古いフィールドとの互換性
  work_dates: string[]
  work_month: string
  company_id?: string
  staff_name: string
  staff_company?: string
  project_manager_id: string | null
  staff_manager_id: string | null
  created_by?: string
  created_at: string
  updated_at: string
  daily_rate?: number
  cost_rate?: number
  work_days?: number
  project_manager?: {
    display_name: string
  }
  staff_manager?: {
    display_name: string
  }
  companies?: {
    name: string
  }
}

interface Staff {
  id: string
  display_name: string
  email: string
  role: string
  department_id: string | null
}

interface Company {
  id: string
  name: string
}

interface AssignmentsClientProps {
  assignments: Assignment[]
  staffList: Staff[]
  companies: Company[]
  currentUserId: string
  userRole: 'admin' | 'leader' | 'member'
}

export default function AssignmentsClient({
  assignments,
  staffList,
  companies,
  currentUserId,
  userRole
}: AssignmentsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'spot' | 'continuous'>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

  // フィルタリング
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.project_location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMonth = !filterMonth || (assignment.work_month && assignment.work_month.startsWith(filterMonth))
    const assignmentType = assignment.assignment_type || assignment.project_type || 'spot'
    const matchesType = filterType === 'all' || assignmentType === filterType
    
    return matchesSearch && matchesMonth && matchesType
  })

  const handleDelete = async (id: string) => {
    if (!confirm('このアサインを削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete error:', error)
        alert(`削除に失敗しました: ${error.message}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert(`削除に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  const canEdit = (assignment: Assignment) => {
    return userRole === 'admin' || 
           userRole === 'leader' || 
           (assignment.created_by && assignment.created_by === currentUserId) ||
           !assignment.created_by  // 古いデータの場合は編集可能にする
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(value)
  }

  const calculateRevenue = (assignment: any) => {
    const type = assignment.assignment_type || assignment.project_type || 'spot'
    const rate = assignment.daily_rate || 0
    
    if (type === 'continuous') {
      return rate * (assignment.work_days || 0)
    } else {
      return rate * (assignment.work_dates?.length || 0)
    }
  }

  const calculateProfit = (assignment: any) => {
    const revenue = calculateRevenue(assignment)
    const type = assignment.assignment_type || assignment.project_type || 'spot'
    const costRate = assignment.cost_rate || 0
    
    const cost = type === 'continuous'
      ? costRate * (assignment.work_days || 0)
      : costRate * (assignment.work_dates?.length || 0)
    return revenue - cost
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">アサイン管理</h1>
        <button
          onClick={() => {
            setEditingAssignment(null)
            setIsFormOpen(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          新規登録
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">すべて</option>
            <option value="continuous">継続</option>
            <option value="spot">スポット</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {filteredAssignments.length} 件のアサイン
          </div>
        </div>
      </div>

      {/* モバイル用カード表示 */}
      <div className="md:hidden">
        {filteredAssignments.map((assignment) => (
          <MobileAssignmentCard
            key={assignment.id}
            assignment={assignment}
            canEdit={canEdit(assignment)}
            onEdit={() => {
              setEditingAssignment(assignment)
              setIsFormOpen(true)
            }}
            onDelete={() => handleDelete(assignment.id)}
          />
        ))}
      </div>

      {/* デスクトップ用テーブル表示 */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  案件情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スタッフ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  稼働期間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  売上/利益
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.project_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.project_location}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-1 ${
                        (assignment.assignment_type || assignment.project_type) === 'continuous'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {(assignment.assignment_type || assignment.project_type) === 'continuous' ? '継続' : 'スポット'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{assignment.staff_name}</div>
                    {assignment.staff_company && (
                      <div className="text-sm text-gray-500">{assignment.staff_company}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {assignment.work_month ? (
                        format(new Date(assignment.work_month), 'yyyy年M月', { locale: ja })
                      ) : (
                        '日付未設定'
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(assignment.assignment_type || assignment.project_type) === 'continuous'
                        ? `${assignment.work_days || 0}日`
                        : `${assignment.work_dates?.length || 0}日`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        案件: {assignment.project_manager?.display_name || '-'}
                      </div>
                      <div className="text-gray-500">
                        人材: {assignment.staff_manager?.display_name || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">
                        {formatCurrency(calculateRevenue(assignment))}
                      </div>
                      <div className="text-green-600">
                        {formatCurrency(calculateProfit(assignment))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {canEdit(assignment) && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAssignment(assignment)
                            setIsFormOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* フォームモーダル */}
      {isFormOpen && (
        <AssignmentForm
          assignment={editingAssignment}
          staffList={staffList}
          companies={companies}
          currentUserId={currentUserId}
          onClose={() => {
            setIsFormOpen(false)
            setEditingAssignment(null)
          }}
          onSave={() => {
            setIsFormOpen(false)
            setEditingAssignment(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}