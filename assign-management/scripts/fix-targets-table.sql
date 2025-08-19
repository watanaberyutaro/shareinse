-- =====================================================
-- 目標設定テーブルのRLSポリシーを修正
-- =====================================================

-- 1. targetsテーブルのRLSを有効化
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

-- 2. 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON targets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON targets;
DROP POLICY IF EXISTS "Enable update for users" ON targets;
DROP POLICY IF EXISTS "Enable delete for admins" ON targets;
DROP POLICY IF EXISTS "Admins can do everything" ON targets;
DROP POLICY IF EXISTS "Leaders can manage targets" ON targets;

-- 3. 新しいポリシーを作成

-- 管理者は全操作可能
CREATE POLICY "Admins can do everything"
ON targets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- リーダーも目標を管理できる
CREATE POLICY "Leaders can manage targets"
ON targets
FOR ALL
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

-- 一般ユーザーは読み取りのみ
CREATE POLICY "Members can read targets"
ON targets
FOR SELECT
TO authenticated
USING (true);

-- 4. targetsテーブルの構造を確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'targets'
ORDER BY ordinal_position;

-- 5. RLSポリシーの確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'targets'
ORDER BY policyname;

-- 6. テスト用の目標データを挿入（既に管理者としてログインしている場合）
-- INSERT INTO targets (
--   target_type,
--   target_id,
--   target_month,
--   sales_target,
--   profit_target,
--   assignment_target,
--   created_by,
--   created_at,
--   updated_at
-- ) VALUES (
--   'company',
--   NULL,
--   date_trunc('month', CURRENT_DATE)::date,
--   10000000,  -- 1000万円
--   2000000,   -- 200万円
--   50,        -- 50件
--   auth.uid(),
--   NOW(),
--   NOW()
-- );

-- 7. 現在の目標データを確認
SELECT 
  t.id,
  t.target_type,
  t.target_id,
  t.target_month,
  t.sales_target,
  t.profit_target,
  t.assignment_target,
  p.display_name as created_by_name,
  t.created_at
FROM targets t
LEFT JOIN profiles p ON t.created_by = p.id
ORDER BY t.target_month DESC, t.created_at DESC
LIMIT 10;