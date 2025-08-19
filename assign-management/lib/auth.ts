import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireAdmin() {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/login')
  }
  
  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }
  
  return profile
}

export async function requireLeaderOrAdmin() {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/login')
  }
  
  if (profile.role !== 'admin' && profile.role !== 'leader') {
    redirect('/dashboard')
  }
  
  return profile
}

export async function canAccessAdminFeatures(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  return profile?.role === 'admin'
}