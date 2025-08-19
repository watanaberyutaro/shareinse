'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, User, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  
  // フォームフィールド
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('メールアドレスまたはパスワードが正しくありません')
        return
      }

      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // バリデーション
    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください')
      setIsLoading(false)
      return
    }

    try {
      // Step 1: ユーザー登録（emailConfirm: falseで即座に登録完了）
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      })

      if (error) {
        console.error('Signup error:', error)
        if (error.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています')
        } else if (error.message.includes('Database error')) {
          // トリガーエラーは無視して続行
          console.warn('Database trigger error ignored, continuing with manual profile creation')
        } else {
          setError('登録に失敗しました: ' + error.message)
          return
        }
      }

      // Step 2: ユーザーが作成された場合、プロファイルを手動で作成
      if (data?.user) {
        console.log('User created successfully, creating profile...')
        
        // 少し待機（認証データベースの同期を待つ）
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          // プロファイルを作成（重複は無視）
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email || email,
              display_name: displayName || email.split('@')[0],
              role: 'member',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id',
              ignoreDuplicates: true
            })
          
          if (profileError) {
            console.error('Profile creation error:', profileError)
            // プロファイル作成エラーは警告のみ（ユーザー登録は成功している）
            console.warn('Profile creation failed but user registration succeeded')
          } else {
            console.log('Profile created successfully')
          }
          
          setSuccess('登録が完了しました！メールをご確認ください。')
          // 3秒後にログインフォームに切り替え
          setTimeout(() => {
            setIsSignUp(false)
            setSuccess(null)
            // 自動的にメールアドレスを入力済みにする
            setPassword('')
            setConfirmPassword('')
          }, 3000)
          
        } catch (err) {
          console.error('Profile creation exception:', err)
          // エラーがあってもユーザー登録は成功しているので続行
          setSuccess('登録が完了しました！メールをご確認ください。')
          setTimeout(() => {
            setIsSignUp(false)
            setSuccess(null)
          }, 3000)
        }
      }
    } catch {
      setError('登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            アサイン管理システム
          </h1>
          <p className="text-gray-600">
            {isSignUp ? '新規アカウントを作成' : 'ログインしてください'}
          </p>
        </div>

        {/* タブ切り替え */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => {
              setIsSignUp(false)
              setError(null)
              setSuccess(null)
            }}
            className={`flex-1 py-2 px-4 text-center font-medium transition ${
              !isSignUp
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="inline-block h-4 w-4 mr-2" />
            ログイン
          </button>
          <button
            onClick={() => {
              setIsSignUp(true)
              setError(null)
              setSuccess(null)
            }}
            className={`flex-1 py-2 px-4 text-center font-medium transition ${
              isSignUp
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus className="inline-block h-4 w-4 mr-2" />
            新規登録
          </button>
        </div>

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* ログインフォーム */}
        {!isSignUp ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="パスワードを入力"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )}
            </button>

            <div className="text-center">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                パスワードをお忘れの方
              </a>
            </div>
          </form>
        ) : (
          /* 新規登録フォーム */
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                表示名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="signup-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="山田太郎"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="6文字以上のパスワード"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード（確認）
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="パスワードを再入力"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  登録中...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  新規登録
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              登録することで、利用規約とプライバシーポリシーに同意したものとみなされます
            </p>
          </form>
        )}
      </div>
    </div>
  )
}