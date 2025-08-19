-- 既存のトリガーと関数を削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 新しい関数を作成（メタデータから表示名を取得）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    display_name, 
    role, 
    department_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    -- メタデータから表示名を取得、なければメールアドレスの@前の部分を使用
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    (SELECT id FROM departments WHERE name = '未分類' LIMIT 1)
  )
  ON CONFLICT (id) DO UPDATE SET
    -- 既存のレコードがある場合は表示名を更新
    display_name = COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      EXCLUDED.display_name
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを再作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 既存ユーザーのメタデータを確認
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'display_name' as meta_display_name,
  p.display_name as profile_display_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;