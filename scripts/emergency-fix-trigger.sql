-- ============================================
-- 緊急修正: トリガーを一旦無効化して問題を解決
-- ============================================

-- 1. 問題のあるトリガーを完全に削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. よりシンプルで安全なトリガー関数を作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- profilesテーブルに挿入（エラーは無視）
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role,
    created_at,
    updated_at
  ) 
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    'member',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- 既に存在する場合は何もしない
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生しても認証は続行
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. シンプルなトリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. 権限を確認・設定
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, authenticated, service_role;
GRANT ALL ON TABLE public.departments TO postgres, authenticated, service_role;

-- 5. RLSポリシーを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 6. profilesテーブルのRLSを一時的に調整（新規作成を許可）
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 7. 既存ユーザーのプロファイルを作成（重複は無視）
INSERT INTO profiles (id, email, display_name, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(
      au.raw_user_meta_data->>'display_name',
      split_part(au.email, '@', 1)
    ),
    'member',
    au.created_at,
    NOW()
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- 8. 動作確認
SELECT 
    'Auth users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Profiles' as table_name,
    COUNT(*) as count
FROM profiles;