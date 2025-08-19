-- =====================================================
-- targetsテーブルのRLSポリシーを完全に修正
-- =====================================================

-- 1. RLSを一時的に無効化して既存ポリシーを削除
ALTER TABLE targets DISABLE ROW LEVEL SECURITY;

-- 2. すべての既存ポリシーを削除
DROP POLICY IF EXISTS "Admins can do everything" ON targets;
DROP POLICY IF EXISTS "Leaders can manage targets" ON targets;
DROP POLICY IF EXISTS "Members can read targets" ON targets;
DROP POLICY IF EXISTS "Enable read access for all users" ON targets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON targets;
DROP POLICY IF EXISTS "Enable update for users" ON targets;
DROP POLICY IF EXISTS "Enable delete for admins" ON targets;

-- 3. RLSを再度有効化
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

-- 4. シンプルで確実に動作するポリシーを作成

-- 読み取り: 全ての認証ユーザーが可能
CREATE POLICY "Anyone can read targets"
ON targets
FOR SELECT
TO authenticated
USING (true);

-- 作成: 管理者とリーダーのみ
CREATE POLICY "Admins and leaders can insert"
ON targets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'leader')
  )
);

-- 更新: 管理者とリーダーのみ
CREATE POLICY "Admins and leaders can update"
ON targets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'leader')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'leader')
  )
);

-- 削除: 管理者のみ
CREATE POLICY "Admins can delete"
ON targets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 5. 現在のユーザーの権限を確認
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.role,
  CASE 
    WHEN p.role IN ('admin', 'leader') THEN '✅ 目標作成可能'
    ELSE '❌ 目標作成不可'
  END as can_create_targets
FROM profiles p
WHERE p.email = 'r.watanabe@share-llc.co.jp'  -- あなたのメールアドレスに変更
LIMIT 1;

-- 6. RLSポリシーの確認
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'targets'
ORDER BY policyname;

-- 7. もし上記でも動作しない場合の緊急対応
-- （一時的に全ユーザーに作成権限を与える）
-- DROP POLICY IF EXISTS "Admins and leaders can insert" ON targets;
-- CREATE POLICY "Anyone can insert temporarily"
-- ON targets
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- 8. 現在のprofilesテーブルのrole分布を確認
SELECT 
  role,
  COUNT(*) as user_count
FROM profiles
GROUP BY role
ORDER BY role;