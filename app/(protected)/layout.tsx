import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userRole = 'member'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    userRole = profile?.role || 'member'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* デスクトップ用サイドバー */}
      <div className="hidden md:flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* モバイル用レイアウト */}
      <div className="md:hidden">
        <main className="pb-16">
          <div className="p-4">
            {children}
          </div>
        </main>
        <MobileNav userRole={userRole} />
      </div>
    </div>
  )
}