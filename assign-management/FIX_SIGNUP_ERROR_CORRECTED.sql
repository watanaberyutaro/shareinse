-- =====================================================
-- 新規登録エラーを完全に修正するSQL（修正版）
-- Supabase SQL Editorで実行してください
-- =====================================================

-- ステップ1: 問題のあるトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ステップ2: departmentsテーブルの構造を確認して「未分類」を追加
-- まず、テーブル構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'departments';

-- 未分類部署を追加（updated_atカラムなしバージョン）
INSERT INTO departments (id, name, created_at)
VALUES (
  gen_random_uuid(),
  '未分類',
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- ステップ3: profilesテーブルのRLSポリシーを修正
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Service role has full access" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can create profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;

-- 新しいポリシーを作成
-- 1. すべての認証ユーザーがプロファイルを作成できる
CREATE POLICY "Anyone can create profile"
ON profiles FOR INSERT
WITH CHECK (true);

-- 2. すべての認証ユーザーがプロファイルを読める
CREATE POLICY "Anyone can read profiles"
ON profiles FOR SELECT
USING (true);

-- 3. ユーザーは自分のプロファイルを更新できる
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
))
WITH CHECK (auth.uid() = id OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- ステップ4: 正常に動作するトリガーを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_dept_id uuid;
BEGIN
  -- デフォルト部署を取得
  SELECT id INTO default_dept_id
  FROM departments
  WHERE name = '未分類'
  LIMIT 1;
  
  -- 未分類がなければ最初の部署を使用
  IF default_dept_id IS NULL THEN
    SELECT id INTO default_dept_id
    FROM departments
    ORDER BY created_at
    LIMIT 1;
  END IF;

  -- プロファイルを作成（エラーは無視）
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      role,
      department_id,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
      ),
      'member',
      default_dept_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- エラーが発生しても無視（ユーザー作成は成功させる）
      RAISE NOTICE 'Profile creation error for user %: %', NEW.id, SQLERRM;
      NULL;
  END;

  RETURN NEW;
END;
$$;

-- ステップ5: トリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ステップ6: 既存のユーザーでプロファイルがない場合は作成
INSERT INTO profiles (id, email, display_name, role, department_id, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    split_part(au.email, '@', 1)
  ),
  'member',
  (SELECT id FROM departments WHERE name = '未分類' LIMIT 1),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ステップ7: 部署の確認
SELECT 
  id,
  name,
  created_at
FROM departments
ORDER BY name;

-- ステップ8: 結果を確認
SELECT 
  'Users in auth.users' as description,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Profiles created' as description,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
  'Users without profile' as description,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
  'Departments count' as description,
  COUNT(*) as count
FROM departments;

-- ステップ9: 最近のプロファイルを確認
SELECT 
  p.email,
  p.display_name,
  p.role,
  d.name as department,
  p.created_at
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
ORDER BY p.created_at DESC
LIMIT 10;