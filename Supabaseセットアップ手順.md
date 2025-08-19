# Supabaseセットアップ手順

## 1. Supabaseプロジェクトの作成

### 1.1 アカウント作成
1. [Supabase](https://supabase.com)にアクセス
2. GitHubアカウントでサインアップ（推奨）
3. 新規プロジェクトを作成
   - プロジェクト名: `assign-management-system`
   - データベースパスワード: 強固なパスワードを設定（保管必須）
   - リージョン: `Northeast Asia (Tokyo)`を選択

### 1.2 プロジェクト情報の取得
プロジェクト作成後、以下の情報をメモ：
- Project URL
- API Key (anon/public)
- API Key (service_role) ※秘密鍵
- Database URL

## 2. 認証（Auth）の設定

### 2.1 認証プロバイダーの設定
1. Supabaseダッシュボード → Authentication → Providers
2. Email認証を有効化
   - Enable Email Provider: ON
   - Confirm email: ON（メール確認を必須にする場合）
3. （オプション）ソーシャル認証の設定
   - Google OAuth
   - Microsoft OAuth

### 2.2 認証設定
Authentication → Settings で以下を設定：
```
- Site URL: http://localhost:3000 (開発環境)
- Redirect URLs: 
  - http://localhost:3000/auth/callback
  - https://your-domain.com/auth/callback (本番環境)
- JWT有効期限: 3600秒（1時間）
```

## 3. データベーステーブルの作成

### 3.1 SQL Editorで以下のテーブルを作成

```sql
-- 部署マスタ
CREATE TABLE departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 部署初期データ
INSERT INTO departments (name) VALUES 
  ('未分類'),
  ('営業一番隊'),
  ('営業二番隊'),
  ('営業三番隊'),
  ('管理部');

-- ユーザープロファイル（Supabase Authと連携）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'leader', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 企業マスタ
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN ('client', 'vendor', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- アサイン情報
CREATE TABLE assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_name TEXT NOT NULL,
  project_location TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('spot', 'continuous')),
  
  -- スタッフ情報
  staff_name TEXT NOT NULL,
  staff_company TEXT,
  
  -- 企業情報
  client_company_id UUID REFERENCES companies(id),
  vendor_company_id UUID REFERENCES companies(id),
  
  -- 金額情報
  daily_rate DECIMAL(10, 2) NOT NULL, -- 稼働単価
  cost_rate DECIMAL(10, 2) NOT NULL,  -- 卸単価
  
  -- 稼働情報
  work_month DATE NOT NULL, -- 対象月（YYYY-MM-01形式で保存）
  work_days INTEGER, -- 継続案件の場合の稼働日数
  work_dates DATE[], -- スポット案件の場合の稼働日配列
  
  -- 担当者
  project_manager_id UUID REFERENCES profiles(id), -- 案件担当者
  staff_manager_id UUID REFERENCES profiles(id),   -- 人材担当者
  
  -- 登録者情報
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- 売上記録（月次集計用）
CREATE TABLE sales_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  record_month DATE NOT NULL, -- YYYY-MM-01形式
  
  -- 売上・利益
  total_sales DECIMAL(12, 2) DEFAULT 0,
  total_profit DECIMAL(12, 2) DEFAULT 0,
  project_profit DECIMAL(12, 2) DEFAULT 0, -- 案件担当分の利益
  staff_profit DECIMAL(12, 2) DEFAULT 0,   -- 人材担当分の利益
  
  -- KPI
  assignment_count INTEGER DEFAULT 0,
  gross_margin_rate DECIMAL(5, 2), -- 粗利率（%）
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, record_month)
);

-- コメント
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 目標値
CREATE TABLE targets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('individual', 'department', 'company')),
  target_id UUID, -- user_id or department_id (NULLの場合は全社)
  target_month DATE NOT NULL,
  
  -- 目標値
  sales_target DECIMAL(12, 2),
  profit_target DECIMAL(12, 2),
  assignment_target INTEGER,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(target_type, target_id, target_month)
);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルに更新トリガーを設定
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sales_records_updated_at BEFORE UPDATE ON sales_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.2 インデックスの作成
```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_assignments_work_month ON assignments(work_month);
CREATE INDEX idx_assignments_project_manager ON assignments(project_manager_id);
CREATE INDEX idx_assignments_staff_manager ON assignments(staff_manager_id);
CREATE INDEX idx_sales_records_month ON sales_records(record_month);
CREATE INDEX idx_sales_records_user ON sales_records(user_id);
CREATE INDEX idx_comments_assignment ON comments(assignment_id);
CREATE INDEX idx_targets_month ON targets(target_month);
```

## 4. Row Level Security (RLS) の設定

### 4.1 RLSを有効化
```sql
-- 各テーブルでRLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
```

### 4.2 ポリシーの作成
```sql
-- プロファイル：全員が閲覧可能、本人のみ更新可能
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- アサイン：全員が閲覧可能
CREATE POLICY "Assignments are viewable by authenticated users" ON assignments
  FOR SELECT USING (auth.jwt() ->> 'role' IS NOT NULL);

-- アサイン：作成者、管理者、隊長が編集可能
CREATE POLICY "Assignments editable by creator, admin, and leaders" ON assignments
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'leader'
  );

-- アサイン：認証済みユーザーが作成可能
CREATE POLICY "Authenticated users can create assignments" ON assignments
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IS NOT NULL);

-- アサイン：作成者、管理者、隊長が削除可能
CREATE POLICY "Assignments deletable by creator, admin, and leaders" ON assignments
  FOR DELETE USING (
    auth.uid() = created_by OR
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'leader'
  );

-- コメント：全員が閲覧・作成可能
CREATE POLICY "Comments are viewable by authenticated users" ON comments
  FOR SELECT USING (auth.jwt() ->> 'role' IS NOT NULL);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IS NOT NULL);

-- コメント：作成者のみ編集・削除可能
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- 目標：管理者のみ作成・編集・削除可能
CREATE POLICY "Only admins can manage targets" ON targets
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 目標：全員が閲覧可能
CREATE POLICY "Targets are viewable by authenticated users" ON targets
  FOR SELECT USING (auth.jwt() ->> 'role' IS NOT NULL);

-- 部署：全員が閲覧可能
CREATE POLICY "Departments are viewable by everyone" ON departments
  FOR SELECT USING (true);

-- 企業：全員が閲覧可能、認証済みユーザーが作成可能
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create companies" ON companies
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IS NOT NULL);

-- 売上記録：本人と管理者・隊長が閲覧可能
CREATE POLICY "Sales records viewable by owner, admin, and leaders" ON sales_records
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'leader'
  );
```

## 5. ストレージの設定

### 5.1 バケットの作成
1. Storage → New bucket
2. バケット名: `avatars`
3. Public bucket: ON（アバター画像は公開）

### 5.2 ストレージポリシーの設定
```sql
-- アバター画像のアップロード権限
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- アバター画像の更新権限
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- アバター画像の削除権限
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 6. 環境変数の設定

### 6.1 プロジェクトルートに `.env.local` を作成
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# アプリケーション設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6.2 型定義の生成（TypeScript使用時）
```bash
# Supabase CLIのインストール
npm install -g supabase

# ログイン
supabase login

# 型定義の生成
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## 7. 初期設定用のヘルパー関数

### 7.1 新規ユーザー登録時のプロファイル作成
```sql
-- auth.usersに新規ユーザーが作成されたら自動的にprofilesを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role, department_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    (SELECT id FROM departments WHERE name = '未分類')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 7.2 売上集計の自動計算関数
```sql
-- 月次売上を自動集計する関数
CREATE OR REPLACE FUNCTION calculate_monthly_sales(
  target_month DATE,
  target_user_id UUID
)
RETURNS TABLE (
  total_sales DECIMAL,
  total_profit DECIMAL,
  project_profit DECIMAL,
  staff_profit DECIMAL,
  assignment_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(
      CASE 
        WHEN a.project_type = 'continuous' THEN a.daily_rate * a.work_days
        ELSE a.daily_rate * array_length(a.work_dates, 1)
      END
    ) as total_sales,
    SUM(
      CASE 
        WHEN a.project_type = 'continuous' THEN (a.daily_rate - a.cost_rate) * a.work_days
        ELSE (a.daily_rate - a.cost_rate) * array_length(a.work_dates, 1)
      END
    ) as total_profit,
    SUM(
      CASE 
        WHEN a.project_manager_id = target_user_id THEN
          CASE 
            WHEN a.project_type = 'continuous' THEN (a.daily_rate - a.cost_rate) * a.work_days * 0.5
            ELSE (a.daily_rate - a.cost_rate) * array_length(a.work_dates, 1) * 0.5
          END
        ELSE 0
      END
    ) as project_profit,
    SUM(
      CASE 
        WHEN a.staff_manager_id = target_user_id THEN
          CASE 
            WHEN a.project_type = 'continuous' THEN (a.daily_rate - a.cost_rate) * a.work_days * 0.5
            ELSE (a.daily_rate - a.cost_rate) * array_length(a.work_dates, 1) * 0.5
          END
        ELSE 0
      END
    ) as staff_profit,
    COUNT(*)::INTEGER as assignment_count
  FROM assignments a
  WHERE 
    a.work_month = target_month AND
    (a.project_manager_id = target_user_id OR a.staff_manager_id = target_user_id);
END;
$$ LANGUAGE plpgsql;
```

## 8. 接続テスト

### 8.1 JavaScript/TypeScriptでの接続例
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 接続テスト
async function testConnection() {
  const { data, error } = await supabase.from('departments').select('*')
  if (error) {
    console.error('接続エラー:', error)
  } else {
    console.log('接続成功! 部署データ:', data)
  }
}
```

## 9. 管理者ユーザーの初期設定

### 9.1 最初の管理者ユーザーを作成
1. Authentication → Users → Invite user
2. メールアドレスを入力して招待
3. SQL Editorで権限を設定：

```sql
-- 特定のユーザーを管理者に設定
UPDATE profiles 
SET role = 'admin', department_id = (SELECT id FROM departments WHERE name = '管理部')
WHERE email = 'admin@example.com';
```

## 10. 本番環境への移行時の注意点

1. **環境変数の更新**
   - 本番環境のURLに変更
   - APIキーを本番用に変更

2. **認証設定の更新**
   - Site URLを本番URLに変更
   - Redirect URLsに本番URLを追加

3. **セキュリティ**
   - Service Role Keyは絶対に公開しない
   - RLSポリシーの再確認
   - CORSの設定確認

4. **バックアップ**
   - Database → Backups で定期バックアップを設定

---

これでSupabaseの基本的なセットアップは完了です。
次は、フロントエンドアプリケーションの実装に進めます。