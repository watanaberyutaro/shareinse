-- ============================================
-- profilesテーブルのRLSポリシーを確認・修正
-- ============================================

-- 1. 現在のポリシーを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. 既存のポリシーを削除（エラーが出ても問題ありません）
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- 3. 新しいポリシーを作成

-- 全員が閲覧可能
CREATE POLICY "Profiles are viewable by authenticated users" 
ON profiles FOR SELECT 
TO authenticated
USING (true);

-- 本人は自分のプロファイルを更新可能
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 管理者は全てのプロファイルを更新可能
CREATE POLICY "Admins can update any profile" 
ON profiles FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- 新規プロファイル作成（トリガー用）
CREATE POLICY "Service role can insert profiles" 
ON profiles FOR INSERT 
TO service_role
WITH CHECK (true);

-- 4. ポリシーが正しく設定されたか確認
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 5. テスト: 現在のユーザーが管理者かどうか確認
SELECT 
    id,
    email,
    display_name,
    role,
    CASE 
        WHEN role = 'admin' THEN '✓ 管理者権限あり'
        ELSE '✗ 管理者権限なし'
    END as admin_status
FROM profiles
WHERE email = 'r.watanabe@share-llc.co.jp';

-- 6. 管理者権限を再確認・設定
UPDATE profiles 
SET 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'r.watanabe@share-llc.co.jp'
RETURNING id, email, display_name, role;