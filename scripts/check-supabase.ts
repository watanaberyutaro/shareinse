import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkSupabase() {
  console.log('🔍 Supabase接続チェック開始...\n')
  
  // 1. 環境変数チェック
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('❌ 環境変数が設定されていません')
    console.log('必要な環境変数:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  
  console.log('✅ 環境変数: OK')
  console.log(`URL: ${url}`)
  console.log(`Key: ${key.substring(0, 20)}...`)
  console.log()
  
  // 2. Supabaseクライアント作成
  const supabase = createClient(url, key)
  
  // 3. データベース接続テスト
  console.log('📊 データベース接続テスト...')
  
  try {
    // テーブル一覧を取得
    const tables = [
      'profiles',
      'assignments', 
      'companies',
      'departments',
      'targets'
    ]
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: ${count}件`)
      }
    }
    
    console.log('\n✅ Supabase接続成功！')
    
  } catch (error) {
    console.error('❌ エラー:', error)
  }
}

checkSupabase()