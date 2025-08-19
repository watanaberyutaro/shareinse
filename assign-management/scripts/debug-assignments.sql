-- =============================================
-- アサインデータのデバッグ用クエリ
-- =============================================

-- 1. 現在登録されているアサインの総数を確認
SELECT COUNT(*) as total_assignments FROM assignments;

-- 2. 各月のアサイン数を確認
SELECT 
    work_month,
    COUNT(*) as assignment_count,
    COUNT(DISTINCT project_manager_id) as unique_project_managers,
    COUNT(DISTINCT staff_manager_id) as unique_staff_managers
FROM assignments
GROUP BY work_month
ORDER BY work_month DESC;

-- 3. 担当者が設定されているアサインを確認
SELECT 
    id,
    project_name,
    work_month,
    project_manager_id,
    staff_manager_id,
    daily_rate,
    cost_rate,
    work_days,
    array_length(work_dates, 1) as work_dates_count,
    created_at
FROM assignments
WHERE project_manager_id IS NOT NULL 
   OR staff_manager_id IS NOT NULL
ORDER BY work_month DESC, created_at DESC
LIMIT 10;

-- 4. 担当者IDとプロファイルの紐付けを確認
SELECT 
    a.id as assignment_id,
    a.project_name,
    a.work_month,
    pm.email as project_manager_email,
    sm.email as staff_manager_email
FROM assignments a
LEFT JOIN profiles pm ON a.project_manager_id = pm.id
LEFT JOIN profiles sm ON a.staff_manager_id = sm.id
WHERE a.work_month >= date_trunc('month', CURRENT_DATE)
ORDER BY a.created_at DESC;

-- 5. 特定ユーザーのアサインを確認（メールアドレスを変更してください）
WITH target_user AS (
    SELECT id, email, display_name 
    FROM profiles 
    WHERE email = 'r.watanabe@share-llc.co.jp'  -- ここを確認したいユーザーのメールに変更
)
SELECT 
    a.id,
    a.project_name,
    a.work_month,
    a.daily_rate,
    a.cost_rate,
    CASE 
        WHEN a.project_type = 'continuous' THEN a.work_days
        ELSE array_length(a.work_dates, 1)
    END as actual_work_days,
    CASE 
        WHEN a.project_manager_id = tu.id THEN '案件担当'
        WHEN a.staff_manager_id = tu.id THEN '人材担当'
        ELSE '関与なし'
    END as role,
    -- 売上計算
    CASE 
        WHEN a.project_manager_id = tu.id AND a.staff_manager_id = tu.id THEN 
            a.daily_rate * COALESCE(a.work_days, array_length(a.work_dates, 1))
        WHEN a.project_manager_id = tu.id OR a.staff_manager_id = tu.id THEN 
            a.daily_rate * COALESCE(a.work_days, array_length(a.work_dates, 1)) * 0.5
        ELSE 0
    END as calculated_sales,
    -- 利益計算
    CASE 
        WHEN a.project_manager_id = tu.id OR a.staff_manager_id = tu.id THEN 
            (a.daily_rate - a.cost_rate) * COALESCE(a.work_days, array_length(a.work_dates, 1)) * 0.5
        ELSE 0
    END as calculated_profit
FROM assignments a
CROSS JOIN target_user tu
WHERE a.project_manager_id = tu.id 
   OR a.staff_manager_id = tu.id
ORDER BY a.work_month DESC, a.created_at DESC;

-- 6. 当月のアサインサマリー
SELECT 
    COUNT(*) as total_assignments,
    SUM(daily_rate * COALESCE(work_days, array_length(work_dates, 1))) as total_sales,
    SUM((daily_rate - cost_rate) * COALESCE(work_days, array_length(work_dates, 1))) as total_profit
FROM assignments
WHERE work_month = date_trunc('month', CURRENT_DATE)::date;