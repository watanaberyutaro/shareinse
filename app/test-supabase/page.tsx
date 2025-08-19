'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('接続テスト中...')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient()
        
        // 1. 接続テスト
        setStatus('Supabase接続を確認中...')
        
        // 2. 環境変数の確認
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          throw new Error('環境変数が設定されていません')
        }
        
        setStatus('環境変数: OK')
        
        // 3. 認証状態の確認
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          setStatus('認証: 未ログイン')
        } else {
          setStatus(`認証: ログイン済み (${user?.email})`)
        }
        
        // 4. データベース接続テスト
        const { data: testData, error: dbError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
        
        if (dbError) {
          throw new Error(`DB接続エラー: ${dbError.message}`)
        }
        
        setData({
          supabaseUrl: url,
          authStatus: user ? 'ログイン済み' : '未ログイン',
          userEmail: user?.email || 'なし',
          dbConnection: 'OK'
        })
        
        setStatus('✅ Supabase接続成功')
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー')
        setStatus('❌ 接続失敗')
      }
    }
    
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase接続テスト</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="font-semibold mb-2">ステータス:</h2>
            <p className={error ? 'text-red-600' : 'text-green-600'}>
              {status}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h3 className="font-semibold text-red-800 mb-1">エラー:</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {data && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold text-green-800 mb-2">接続情報:</h3>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="inline font-medium">Supabase URL:</dt>
                  <dd className="inline ml-2">{data.supabaseUrl}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">認証状態:</dt>
                  <dd className="inline ml-2">{data.authStatus}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">ユーザー:</dt>
                  <dd className="inline ml-2">{data.userEmail}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">DB接続:</dt>
                  <dd className="inline ml-2">{data.dbConnection}</dd>
                </div>
              </dl>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">トラブルシューティング:</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li>Vercelの環境変数が正しく設定されているか確認</li>
              <li>Supabaseダッシュボードでプロジェクトが稼働中か確認</li>
              <li>RLSポリシーが適切に設定されているか確認</li>
              <li>Supabase URLが正しいか確認（httpではなくhttps）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}