'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLoading } from '@/components/LoadingProvider'
import {
  LayoutDashboard,
  Users,
  FileText,
  User,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'

const menuItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/assignments', label: 'アサイン管理', icon: Users },
  { href: '/reports', label: 'レポート', icon: BarChart3 },
  { href: '/mypage', label: 'マイページ', icon: User },
]

const adminMenuItems = [
  { href: '/admin/users', label: 'ユーザー管理', icon: Settings },
  { href: '/admin/targets', label: '目標設定', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { setIsLoading: setPageLoading } = useLoading()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setUserRole(profile?.role || null)
      }
      setIsLoading(false)
    }

    fetchUserRole()
  }, [])

  const handleLogout = async () => {
    setPageLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* モバイルメニューボタン */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* サイドバー */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-auto
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">アサイン管理</h2>
          </div>

          <nav className="flex-1 px-4 pb-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* 管理者メニュー - 管理者のみ表示 */}
            {!isLoading && userRole === 'admin' && (
              <div className="mt-8">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  管理者
                </h3>
                <ul className="mt-3 space-y-2">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={handleLinkClick}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                            ${isActive 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-600 hover:bg-gray-50'
                            }
                          `}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">ログアウト</span>
            </button>
          </div>
        </div>
      </aside>

      {/* モバイル用オーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}