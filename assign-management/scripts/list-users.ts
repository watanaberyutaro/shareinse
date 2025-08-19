/**
 * ユーザー一覧表示スクリプト
 * 
 * 使い方:
 * npx tsx scripts/list-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// .env.localファイルを読み込み
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function listUsers() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        departments (
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ エラーが発生しました:', error.message)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('ユーザーが登録されていません')
      return
    }

    console.log('\n📋 登録ユーザー一覧\n')
    console.log('━'.repeat(80))
    
    profiles.forEach((profile, index) => {
      const roleEmoji = profile.role === 'admin' ? '👑' : profile.role === 'leader' ? '⭐' : '👤'
      const roleLabel = profile.role === 'admin' ? '管理者' : profile.role === 'leader' ? '隊長' : 'メンバー'
      
      console.log(`${index + 1}. ${roleEmoji} ${profile.display_name}`)
      console.log(`   メール: ${profile.email}`)
      console.log(`   権限: ${roleLabel} (${profile.role})`)
      console.log(`   部署: ${profile.departments?.name || '未分類'}`)
      console.log(`   登録日: ${new Date(profile.created_at).toLocaleDateString('ja-JP')}`)
      if (index < profiles.length - 1) {
        console.log('─'.repeat(80))
      }
    })
    
    console.log('━'.repeat(80))
    console.log(`\n合計: ${profiles.length} ユーザー`)
    
    const adminCount = profiles.filter(p => p.role === 'admin').length
    const leaderCount = profiles.filter(p => p.role === 'leader').length
    const memberCount = profiles.filter(p => p.role === 'member').length
    
    console.log(`内訳: 管理者 ${adminCount}名, 隊長 ${leaderCount}名, メンバー ${memberCount}名`)
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
  }
}

console.log('🔍 ユーザー一覧を取得しています...')
listUsers()