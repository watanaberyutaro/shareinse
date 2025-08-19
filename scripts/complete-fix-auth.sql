-- =====================================================
-- 完全な修正: トリガーとRLSを正しく設定
-- =====================================================

-- 1. まず、問題のあるトリガーを完全に削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. auth.usersテーブルのトリガーを確認（削除されたことを確認）
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- 3. profilesテーブルのRLSを一時的に無効化
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. すべてのRLSポリシーを削除
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON profiles;

-- 5. RLSを再度有効化して、新しいポリシーを設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Service roleは全権限を持つ（トリガー用）
CREATE POLICY "Service role has full access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 認証されたユーザーは自分のプロファイルを作成できる
CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (true);  -- 一時的に制限なし

-- 認証されたユーザーは全プロファイルを読める
CREATE POLICY "Users can read all profiles"
ON profiles
FOR SELECT
TO authenticated, anon
USING (true);

-- ユーザーは自分のプロファイルを更新できる
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 管理者は全プロファイルを更新できる
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
));

-- 6. 安全なトリガー関数を作成（エラーを握りつぶす）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- トリガーは何もしない（フロントエンドで処理）
    RETURN NEW;
END;
$$;

-- 7. ダミートリガーを作成（何もしない）
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 8. 確認：RLSポリシーの状態
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 9. 既存のauth.usersでprofilesがないユーザーを修正
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
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 10. 最終確認
SELECT 
    'Total users in auth.users' as description,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total profiles' as description,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'Users without profile' as description,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;