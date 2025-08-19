'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Edit2, Trash2, Save, X, CheckCircle, AlertCircle } from 'lucide-react'

interface Profile {
  id: string
  email: string
  display_name: string
  department_id: string | null
  role: 'admin' | 'leader' | 'member'
  avatar_url: string | null
  created_at: string
  updated_at: string
  departments?: {
    id: string
    name: string
  }
}

interface Department {
  id: string
  name: string
  created_at: string
}

export default function UsersClient({ 
  users, 
  departments 
}: { 
  users: Profile[]
  departments: Department[]
}) {
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Profile>>({})
  const [usersList, setUsersList] = useState(users)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const supabase = createClient()

  // 通知を3秒後に自動的に非表示にする
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleEdit = (user: Profile) => {
    setEditingUser(user.id)
    setFormData({
      display_name: user.display_name,
      department_id: user.department_id,
      role: user.role,
    })
  }

  const handleCancel = () => {
    setEditingUser(null)
    setFormData({})
  }

  const handleSave = async (userId: string) => {
    try {
      // 現在のユーザー情報を確認
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      console.log('Current user:', currentUser?.id)
      
      // 現在のユーザーの権限を確認
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser?.id || '')
        .single()
      console.log('Current user role:', currentProfile?.role)

      // 部署IDが空文字の場合はnullに変換
      const updateData = {
        display_name: formData.display_name,
        department_id: formData.department_id === '' ? null : formData.department_id,
        role: formData.role
      }

      console.log('Updating user:', userId)
      console.log('Update data:', updateData)

      // まず更新を実行
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()

      console.log('Update result:', updateResult)
      console.log('Update error:', updateError)

      if (updateError) {
        console.error('Update error:', updateError)
        showNotification('error', `更新エラー: ${updateError.message}`)
        return
      }

      // 更新後、データを再取得
      const { data: updatedUser, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          *,
          departments (
            id,
            name
          )
        `)
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        // 更新は成功したが取得に失敗した場合、ローカルで更新
        setUsersList(usersList.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                ...formData,
                departments: formData.department_id 
                  ? departments.find(d => d.id === formData.department_id) 
                  : undefined
              }
            : user
        ))
      } else if (updatedUser) {
        // 更新されたデータで置き換え
        setUsersList(usersList.map(user => 
          user.id === userId ? updatedUser : user
        ))
      }

      setEditingUser(null)
      setFormData({})
      showNotification('success', 'ユーザー情報を更新しました')
      
    } catch (err) {
      console.error('Unexpected error:', err)
      showNotification('error', '予期しないエラーが発生しました')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'leader':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者'
      case 'leader':
        return '隊長'
      default:
        return 'メンバー'
    }
  }

  return (
    <div>
      {/* 通知メッセージ */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-opacity ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <p className="mt-2 text-gray-600">システムユーザーの管理と権限設定</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                部署
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                権限
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersList.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={user.avatar_url} 
                          alt="" 
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      {editingUser === user.id ? (
                        <input
                          type="text"
                          value={formData.display_name || ''}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                          className="text-sm font-medium text-gray-900 border rounded px-2 py-1"
                        />
                      ) : (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {user.display_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user.id ? (
                    <select
                      value={formData.department_id === null ? '' : (formData.department_id || '')}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value || null })}
                      className="text-sm text-gray-900 border rounded px-2 py-1 w-full"
                    >
                      <option value="">未分類</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-900">
                      {user.departments?.name || '未分類'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user.id ? (
                    <select
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as Profile['role'] })}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="member">メンバー</option>
                      <option value="leader">隊長</option>
                      <option value="admin">管理者</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingUser === user.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(user.id)}
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
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
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