-- ============================================
-- 手順1: profilesテーブルの確認
-- ============================================
SELECT id, email, display_name, role, created_at 
FROM profiles
WHERE email = 'r.watanabe@share-llc.co.jp';

-- もし上記で0件の場合、以下も確認：

-- ============================================
-- 手順2: auth.usersテーブルの確認
-- ============================================
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'r.watanabe@share-llc.co.jp';

-- ============================================
-- 手順3: もしauth.usersに存在してprofilesに存在しない場合、
-- profilesレコードを作成
-- ============================================
INSERT INTO profiles (id, email, display_name, role, department_id)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email),
    'admin',
    d.id
FROM auth.users au
CROSS JOIN (SELECT id FROM departments WHERE name = '管理部' LIMIT 1) d
WHERE au.email = 'r.watanabe@share-llc.co.jp'
ON CONFLICT (id) DO UPDATE 
SET 
    role = 'admin',
    department_id = EXCLUDED.department_id,
    updated_at = NOW()
RETURNING *;

-- ============================================
-- 手順4: 作成/更新後の確認
-- ============================================
SELECT 
    p.id, 
    p.email, 
    p.display_name, 
    p.role,
    d.name as department_name,
    p.created_at,
    p.updated_at
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
WHERE p.email = 'r.watanabe@share-llc.co.jp';

-- ============================================
-- 手順5: すべてのprofilesを確認（デバッグ用）
-- ============================================
SELECT 
    p.id, 
    p.email, 
    p.display_name, 
    p.role,
    d.name as department_name
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
ORDER BY p.created_at DESC;