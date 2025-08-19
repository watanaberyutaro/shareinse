'use client'

import { Calendar, MapPin, Building2, User, Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

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

interface MobileAssignmentCardProps {
  assignment: Assignment
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function MobileAssignmentCard({ 
  assignment, 
  canEdit, 
  onEdit, 
  onDelete 
}: MobileAssignmentCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getAssignmentTypeLabel = (type?: 'spot' | 'continuous') => {
    return type === 'spot' ? 'スポット' : '継続'
  }

  // assignment_type または project_type を使用（後方互換性）
  const assignmentType = assignment.assignment_type || assignment.project_type || 'spot'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              assignmentType === 'spot' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {getAssignmentTypeLabel(assignmentType)}
            </span>
            <span className="text-xs text-gray-500">#{assignment.project_number}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-base">
            {assignment.project_name}
          </h3>
        </div>
        {canEdit && (
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 詳細情報 */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{assignment.companies?.name || '未設定'}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{assignment.project_location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <User className="h-4 w-4 text-gray-400" />
          <span>{assignment.staff_name}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>
            {format(new Date(assignment.work_month + '-01'), 'yyyy年M月', { locale: ja })}
            {assignmentType === 'spot' && assignment.work_dates && (
              <span className="ml-1">({assignment.work_dates.length}日間)</span>
            )}
          </span>
        </div>
      </div>

      {/* 担当者 */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
        <div>
          <span className="text-gray-500">案件担当:</span>
          <span className="ml-1 text-gray-700">
            {assignment.project_manager?.display_name || '未設定'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">人材担当:</span>
          <span className="ml-1 text-gray-700">
            {assignment.staff_manager?.display_name || '未設定'}
          </span>
        </div>
      </div>
    </div>
  )
}