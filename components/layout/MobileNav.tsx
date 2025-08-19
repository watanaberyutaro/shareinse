'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, TrendingUp, User, Settings } from 'lucide-react'

export default function MobileNav({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  
  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'ホーム',
      roles: ['admin', 'leader', 'member']
    },
    {
      href: '/assignments',
      icon: FileText,
      label: 'アサイン',
      roles: ['admin', 'leader', 'member']
    },
    {
      href: '/reports',
      icon: TrendingUp,
      label: 'レポート',
      roles: ['admin', 'leader']
    },
    {
      href: '/mypage',
      icon: User,
      label: 'マイページ',
      roles: ['admin', 'leader', 'member']
    },
    {
      href: '/admin/targets',
      icon: Settings,
      label: '管理',
      roles: ['admin', 'leader']
    }
  ]
  
  const filteredItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole || 'member')
  )
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname?.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center space-y-1
                ${isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}