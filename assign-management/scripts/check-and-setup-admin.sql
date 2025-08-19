-- 1. まず、profilesテーブルにユーザーが存在するか確認
SELECT id, email, display_name, role, created_at 
FROM profiles
ORDER BY created_at DESC;

-- もしユーザーが0件の場合は、まず誰かがサインアップする必要があります

-- 2. ユーザーが存在する場合、特定のメールアドレスを管理者に設定
-- （下記のメールアドレスを実際のメールアドレスに変更してください）
UPDATE profiles 
SET 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'your-email@example.com'  -- ここを実際のメールアドレスに変更
RETURNING id, email, display_name, role;

-- 3. 設定後の確認
SELECT id, email, display_name, role 
FROM profiles 
WHERE role = 'admin';