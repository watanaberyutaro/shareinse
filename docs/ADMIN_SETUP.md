# 管理者設定ガイド

## 管理者権限について

システムには3つの権限レベルがあります：
- **管理者 (admin)**: 全機能へのアクセス権（ユーザー管理、目標設定など）
- **隊長 (leader)**: チーム管理機能へのアクセス権
- **メンバー (member)**: 基本機能のみ

## 初期管理者の設定方法

### 方法1: コマンドラインツールを使用（推奨）

1. **必要なパッケージをインストール**
```bash
cd assign-management
npm install
```

2. **環境変数を確認**
`.env.local`ファイルに以下が設定されていることを確認：
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. **ユーザー一覧を確認**
```bash
npm run list:users
```

4. **管理者を設定**
```bash
npm run setup:admin <メールアドレス>

# 例：
npm run setup:admin admin@example.com
```

### 方法2: Supabaseダッシュボードから直接設定

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. 左メニューから「SQL Editor」を選択
4. 以下のSQLを実行：

```sql
-- ユーザー一覧を確認
SELECT id, email, display_name, role 
FROM profiles;

-- 特定のユーザーを管理者に設定
UPDATE profiles 
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'admin@example.com';  -- 管理者にしたいメールアドレス
```

### 方法3: 既存の管理者による設定

管理者権限を持つユーザーでログイン後：
1. サイドバーの「管理者」セクションから「ユーザー管理」をクリック
2. 対象ユーザーの「編集」ボタンをクリック
3. 権限を「管理者」に変更して保存

## トラブルシューティング

### ユーザーが見つからない場合
- ユーザーは先にシステムにサインアップする必要があります
- `/login`ページから新規登録を行ってください

### 権限変更が反映されない場合
1. ブラウザのキャッシュをクリア
2. ログアウトして再度ログイン
3. それでも解決しない場合は、以下のSQLで確認：
```sql
SELECT * FROM profiles WHERE email = 'your-email@example.com';
```

### Service Role Keyが見つからない場合
1. Supabaseダッシュボードにログイン
2. Project Settings → API
3. 「service_role」のキーをコピー（秘密鍵なので取り扱い注意）

## セキュリティ上の注意

- `SUPABASE_SERVICE_ROLE_KEY`は絶対に公開しないでください
- 本番環境では環境変数を安全に管理してください
- 管理者権限は信頼できるユーザーのみに付与してください

## 管理者ができること

管理者権限を持つユーザーは以下の機能にアクセスできます：

1. **ユーザー管理** (`/admin/users`)
   - ユーザーの権限変更（管理者、隊長、メンバー）
   - ユーザーの部署変更
   - ユーザー情報の編集

2. **目標設定** (`/admin/targets`)
   - 個人目標の設定
   - 部署目標の設定
   - 全社目標の設定
   - 売上・利益・案件数の目標管理

## よくある質問

**Q: 最初の管理者は誰が設定しますか？**
A: システムセットアップ時に、データベースアクセス権を持つ開発者が設定します。

**Q: 管理者を解除するには？**
A: 他の管理者がユーザー管理画面から権限を「メンバー」または「隊長」に変更できます。

**Q: 管理者が0人になった場合は？**
A: データベースから直接設定する必要があります（方法1または方法2を使用）。