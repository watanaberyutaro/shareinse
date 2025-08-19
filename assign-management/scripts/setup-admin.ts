/**
 * 初期管理者セットアップスクリプト
 * 
 * 使い方:
 * 1. .env.localファイルに環境変数を設定
 * 2. 以下のコマンドを実行:
 *    npx tsx scripts/setup-admin.ts <email>
 * 
 * 例: npx tsx scripts/setup-admin.ts admin@example.com
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

async function setupAdmin(email: string) {
  try {
    // メールアドレスでユーザーを検索
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.error(`❌ ユーザーが見つかりません: ${email}`)
        console.log('💡 ヒント: ユーザーは先にサインアップする必要があります')
      } else {
        console.error('❌ エラーが発生しました:', fetchError.message)
      }
      return
    }

    // 既に管理者の場合
    if (profile.role === 'admin') {
      console.log(`✅ ${email} は既に管理者です`)
      return
    }

    // 管理者権限を付与
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('❌ 更新エラー:', updateError.message)
      return
    }

    console.log(`✅ ${email} を管理者に設定しました`)
    console.log('📝 詳細:')
    console.log(`  - ユーザーID: ${profile.id}`)
    console.log(`  - 表示名: ${profile.display_name}`)
    console.log(`  - 以前の権限: ${profile.role} → admin`)
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
  }
}

// コマンドライン引数を取得
const email = process.argv[2]

if (!email) {
  console.log('使い方: npx tsx scripts/setup-admin.ts <email>')
  console.log('例: npx tsx scripts/setup-admin.ts admin@example.com')
  process.exit(1)
}

// メールアドレスの簡単な検証
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  console.error('❌ 無効なメールアドレスです')
  process.exit(1)
}

console.log(`🔧 ${email} を管理者に設定しています...`)
setupAdmin(email)