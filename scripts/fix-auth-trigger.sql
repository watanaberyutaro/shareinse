-- ============================================
-- 新規ユーザー登録時のトリガーを修正
-- ============================================

-- 1. 既存のトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. 改善されたプロファイル自動作成関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_dept_id uuid;
  user_display_name text;
BEGIN
  -- エラーハンドリング用のブロック
  BEGIN
    -- デフォルトの部署IDを取得
    SELECT id INTO default_dept_id 
    FROM departments 
    WHERE name = '未分類' 
    LIMIT 1;
    
    -- 未分類部署がない場合は最初の部署を使用
    IF default_dept_id IS NULL THEN
      SELECT id INTO default_dept_id 
      FROM departments 
      ORDER BY created_at 
      LIMIT 1;
    END IF;
    
    -- 表示名を決定
    user_display_name := COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    );
    
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
      user_display_name,
      'member',  -- デフォルトはmember権限
      default_dept_id,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
      updated_at = CURRENT_TIMESTAMP;
    
    -- ログ出力（デバッグ用）
    RAISE NOTICE 'Profile created for user %: %', NEW.id, NEW.email;
    
    RETURN NEW;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- エラーをログに記録しつつ、認証自体は成功させる
      RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
      -- 認証は成功させる
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. トリガーを再作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. トリガーの状態を確認
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_proc.oid = pg_trigger.tgfoid
WHERE tgname = 'on_auth_user_created';

-- 5. 関数の存在を確認
SELECT 
  proname as function_name,
  pronargs as argument_count,
  prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 6. profilesテーブルの制約を確認
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- 7. 既存のauth.usersでprofilesが作成されていないユーザーを修正
INSERT INTO profiles (id, email, display_name, role, department_id, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(
      au.raw_user_meta_data->>'display_name',
      au.raw_user_meta_data->>'full_name',
      split_part(au.email, '@', 1)
    ),
    'member',
    (SELECT id FROM departments WHERE name = '未分類' LIMIT 1),
    au.created_at,
    CURRENT_TIMESTAMP
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 8. 結果を確認
SELECT 
    'Total auth.users' as description,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total profiles' as description,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'Users without profiles' as description,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;