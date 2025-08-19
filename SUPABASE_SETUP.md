# Supabase設定チェックリスト

## ✅ ローカル環境
- Supabase接続: **成功**
- データベース接続: **OK**
- テーブルアクセス: **OK**

## 🔍 Vercelで確認すべき項目

### 1. 環境変数（必須）
Vercelダッシュボード > Settings > Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://dlscdnfyofqyhyhylotn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsc2NkbmZ5b2ZxeWh5aHlsb3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMTYzMDAsImV4cCI6MjA3MDg5MjMwMH0.5kWJr0bOzzRPZgfS4p3-gPDxc4HSf5TwfObSchQz8C4
```

**重要**: 
- すべての環境（Production, Preview, Development）にチェック
- 値の前後にスペースがないことを確認

### 2. Supabaseダッシュボードでの設定

#### a. URL設定（Settings > API）
- Allowed redirect URLs に以下を追加:
  - `https://shareinse.vercel.app/**`
  - `https://*.vercel.app/**`

#### b. RLSポリシー確認
すでに設定済みですが、以下を確認:
- profiles テーブル: 認証ユーザーのみアクセス可
- assignments テーブル: 認証ユーザーのみアクセス可
- companies テーブル: 認証ユーザーのみアクセス可
- departments テーブル: 認証ユーザーのみアクセス可
- targets テーブル: 認証ユーザーのみアクセス可

### 3. テストページでの確認
デプロイ後、以下のURLにアクセス:
```
https://[your-app].vercel.app/test-supabase
```

このページで接続状態を確認できます。

## トラブルシューティング

### エラー: "Failed to fetch"
- Vercel環境変数が正しく設定されているか確認
- Supabase URLがhttpsで始まっているか確認

### エラー: "Invalid API key"
- NEXT_PUBLIC_SUPABASE_ANON_KEYが完全にコピーされているか確認
- キーの前後にスペースがないか確認

### エラー: "Row level security policy violation"
- ユーザーがログインしているか確認
- RLSポリシーが適切に設定されているか確認

### エラー: "CORS policy"
- Supabaseダッシュボードで許可URLを追加
- Vercelのドメインが追加されているか確認