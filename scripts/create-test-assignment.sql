-- =============================================
-- テスト用アサインデータの作成
-- =============================================

-- 1. 現在のユーザーを確認
SELECT id, email, display_name, role 
FROM profiles 
ORDER BY created_at DESC;

-- 2. テスト用アサインを作成（ユーザーIDを実際のIDに変更してください）
-- 以下のクエリの 'YOUR_USER_ID' を上記で確認したユーザーIDに置き換えて実行

INSERT INTO assignments (
    project_name,
    project_location,
    project_type,
    staff_name,
    staff_company,
    daily_rate,
    cost_rate,
    work_month,
    work_days,
    project_manager_id,
    staff_manager_id,
    created_by
) VALUES (
    'テストプロジェクト - ' || TO_CHAR(CURRENT_DATE, 'MM月'),
    '東京',
    'continuous',
    'テストスタッフ',
    'テスト会社',
    10000,  -- 稼働単価: 10,000円/日
    8000,   -- 卸単価: 8,000円/日
    date_trunc('month', CURRENT_DATE)::date,  -- 当月
    20,     -- 稼働日数: 20日
    'YOUR_USER_ID',  -- 案件担当者ID（ここを変更）
    'YOUR_USER_ID',  -- 人材担当者ID（ここを変更）
    'YOUR_USER_ID'   -- 作成者ID（ここを変更）
);

-- 3. 作成したアサインを確認
SELECT 
    a.id,
    a.project_name,
    a.work_month,
    a.daily_rate,
    a.cost_rate,
    a.work_days,
    a.daily_rate * a.work_days as total_sales,
    (a.daily_rate - a.cost_rate) * a.work_days as total_profit,
    pm.email as project_manager,
    sm.email as staff_manager
FROM assignments a
LEFT JOIN profiles pm ON a.project_manager_id = pm.id
LEFT JOIN profiles sm ON a.staff_manager_id = sm.id
WHERE a.project_name LIKE 'テストプロジェクト%'
ORDER BY a.created_at DESC;