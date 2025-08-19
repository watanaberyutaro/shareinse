-- ============================================
-- 新規ユーザー登録時に自動的にprofileを作成するトリガー
-- ============================================

-- 1. まず既存のトリガーがあれば削除（エラーが出ても問題ありません）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. プロファイル自動作成関数を作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- デフォルトの部署IDを取得（未分類）
  DECLARE
    default_dept_id uuid;
  BEGIN
    SELECT id INTO default_dept_id FROM departments WHERE name = '未分類' LIMIT 1;
    
    -- もし未分類部署が存在しない場合はNULL
    IF default_dept_id IS NULL THEN
      SELECT id INTO default_dept_id FROM departments LIMIT 1;
    END IF;
    
    -- profilesテーブルに新規レコードを挿入
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
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)  -- メールアドレスの@前の部分を使用
      ),
      COALESCE(NEW.raw_user_meta_data->>'role', 'member'),  -- デフォルトはmember
      default_dept_id,
      NOW(),
      NOW()
    );
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. トリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 既存のauth.usersでprofilesが作成されていないユーザーを修正
-- ============================================

-- 4. 既存ユーザーのprofilesレコードを作成
INSERT INTO profiles (id, email, display_name, role, department_id, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(
      au.raw_user_meta_data->>'display_name',
      au.raw_user_meta_data->>'full_name',
      split_part(au.email, '@', 1)
    ),
    'member',  -- デフォルトはmember権限
    (SELECT id FROM departments WHERE name = '未分類' LIMIT 1),
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;  -- profilesに存在しないユーザーのみ

-- 5. 結果を確認
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as count
FROM profiles;

-- 6. r.watanabe@share-llc.co.jp を管理者に設定
UPDATE profiles 
SET 
    role = 'admin',
    department_id = (SELECT id FROM departments WHERE name = '管理部' LIMIT 1),
    updated_at = NOW()
WHERE email = 'r.watanabe@share-llc.co.jp'
RETURNING id, email, display_name, role;

-- 7. 最終確認：すべてのユーザーとその権限を表示
SELECT 
    p.email,
    p.display_name,
    p.role,
    d.name as department,
    p.created_at,
    CASE 
        WHEN au.id IS NOT NULL THEN '✓ 認証OK'
        ELSE '✗ 認証なし'
    END as auth_status
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;