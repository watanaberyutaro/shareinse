'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Target, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TargetData {
  id: string
  target_type: 'individual' | 'department' | 'company'
  target_id: string | null
  target_month: string
  sales_target: number | null
  profit_target: number | null
  assignment_target: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface User {
  id: string
  display_name: string
  email: string
}

interface Department {
  id: string
  name: string
}

export default function TargetsClient({ 
  targets, 
  users,
  departments 
}: { 
  targets: TargetData[]
  users: User[]
  departments: Department[]
}) {
  const [targetsList, setTargetsList] = useState(targets)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTarget, setEditingTarget] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TargetData>>({})
  const supabase = createClient()

  const handleCreate = () => {
    setIsCreating(true)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    setFormData({
      target_type: 'individual',
      target_month: format(currentMonth, 'yyyy-MM-dd'),
      sales_target: null,
      profit_target: null,
      assignment_target: null,
    })
  }

  const handleEdit = (target: TargetData) => {
    setEditingTarget(target.id)
    setFormData({
      target_type: target.target_type,
      target_id: target.target_id,
      target_month: target.target_month,
      sales_target: target.sales_target,
      profit_target: target.profit_target,
      assignment_target: target.assignment_target,
    })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingTarget(null)
    setFormData({})
  }

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('ユーザー情報が取得できません。再度ログインしてください。')
        return
      }

      // 入力値の検証
      if (formData.target_type !== 'company' && !formData.target_id) {
        alert('対象を選択してください')
        return
      }

      if (isCreating) {
        console.log('Creating new target with data:', formData)
        
        const insertData = {
          target_type: formData.target_type,
          target_id: formData.target_type === 'company' ? null : formData.target_id,
          target_month: formData.target_month,
          sales_target: formData.sales_target || 0,
          profit_target: formData.profit_target || 0,
          assignment_target: formData.assignment_target || 0,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('Insert data:', insertData)
        
        const { data, error } = await supabase
          .from('targets')
          .insert(insertData)
          .select()
          .single()

        if (error) {
          console.error('Error creating target:', error)
          alert(`目標の作成に失敗しました: ${error.message}`)
        } else if (data) {
          console.log('Target created successfully:', data)
          setTargetsList([data, ...targetsList])
          setIsCreating(false)
          setFormData({})
          alert('目標を作成しました')
        }
      } else if (editingTarget) {
        console.log('Updating target:', editingTarget, 'with data:', formData)
        
        const updateData = {
          target_type: formData.target_type,
          target_id: formData.target_type === 'company' ? null : formData.target_id,
          target_month: formData.target_month,
          sales_target: formData.sales_target || 0,
          profit_target: formData.profit_target || 0,
          assignment_target: formData.assignment_target || 0,
          updated_at: new Date().toISOString()
        }
        
        const { error } = await supabase
          .from('targets')
          .update(updateData)
          .eq('id', editingTarget)

        if (error) {
          console.error('Error updating target:', error)
          alert(`目標の更新に失敗しました: ${error.message}`)
        } else {
          console.log('Target updated successfully')
          setTargetsList(targetsList.map(target => 
            target.id === editingTarget 
              ? { ...target, ...formData }
              : target
          ))
          setEditingTarget(null)
          setFormData({})
          alert('目標を更新しました')
        }
      }
    } catch (error: any) {
      console.error('Error in handleSave:', error)
      alert(`エラーが発生しました: ${error.message || '不明なエラー'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この目標を削除してもよろしいですか？')) return

    const { error } = await supabase
      .from('targets')
      .delete()
      .eq('id', id)

    if (!error) {
      setTargetsList(targetsList.filter(target => target.id !== id))
    }
  }

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'individual':
        return '個人'
      case 'department':
        return '部署'
      case 'company':
        return '全社'
      default:
        return type
    }
  }

  const getTargetName = (target: TargetData) => {
    if (target.target_type === 'company') {
      return '全社'
    } else if (target.target_type === 'department') {
      const dept = departments.find(d => d.id === target.target_id)
      return dept?.name || '不明'
    } else {
      const user = users.find(u => u.id === target.target_id)
      return user?.display_name || '不明'
    }
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">目標設定</h1>
          <p className="mt-2 text-gray-600">売上・利益・案件数の目標管理</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          新規目標
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                対象月
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                種別
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                対象
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                売上目標
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                利益目標
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                案件数目標
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isCreating && (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="month"
                    value={formData.target_month?.substring(0, 7) || ''}
                    onChange={(e) => setFormData({ ...formData, target_month: `${e.target.value}-01` })}
                    className="text-sm border rounded px-2 py-1"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={formData.target_type || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      target_type: e.target.value as TargetData['target_type'],
                      target_id: null
                    })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="individual">個人</option>
                    <option value="department">部署</option>
                    <option value="company">全社</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formData.target_type === 'company' ? (
                    <span className="text-sm text-gray-900">全社</span>
                  ) : formData.target_type === 'department' ? (
                    <select
                      value={formData.target_id || ''}
                      onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="">選択してください</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={formData.target_id || ''}
                      onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="">選択してください</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.display_name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={formData.sales_target || ''}
                    onChange={(e) => setFormData({ ...formData, sales_target: Number(e.target.value) })}
                    className="text-sm border rounded px-2 py-1 w-24"
                    placeholder="0"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={formData.profit_target || ''}
                    onChange={(e) => setFormData({ ...formData, profit_target: Number(e.target.value) })}
                    className="text-sm border rounded px-2 py-1 w-24"
                    placeholder="0"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={formData.assignment_target || ''}
                    onChange={(e) => setFormData({ ...formData, assignment_target: Number(e.target.value) })}
                    className="text-sm border rounded px-2 py-1 w-20"
                    placeholder="0"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {targetsList.map((target) => (
              <tr key={target.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingTarget === target.id ? (
                    <input
                      type="month"
                      value={formData.target_month?.substring(0, 7) || ''}
                      onChange={(e) => setFormData({ ...formData, target_month: `${e.target.value}-01` })}
                      className="text-sm border rounded px-2 py-1"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      {format(new Date(target.target_month), 'yyyy年MM月', { locale: ja })}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {getTargetTypeLabel(target.target_type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getTargetName(target)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingTarget === target.id ? (
                    <input
                      type="number"
                      value={formData.sales_target || ''}
                      onChange={(e) => setFormData({ ...formData, sales_target: Number(e.target.value) })}
                      className="text-sm border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      ¥{target.sales_target?.toLocaleString() || '-'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingTarget === target.id ? (
                    <input
                      type="number"
                      value={formData.profit_target || ''}
                      onChange={(e) => setFormData({ ...formData, profit_target: Number(e.target.value) })}
                      className="text-sm border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      ¥{target.profit_target?.toLocaleString() || '-'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingTarget === target.id ? (
                    <input
                      type="number"
                      value={formData.assignment_target || ''}
                      onChange={(e) => setFormData({ ...formData, assignment_target: Number(e.target.value) })}
                      className="text-sm border rounded px-2 py-1 w-20"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      {target.assignment_target || '-'}件
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingTarget === target.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(target)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(target.id)}
                        className="text-red-600 hover:text-red-900"
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
  )
}