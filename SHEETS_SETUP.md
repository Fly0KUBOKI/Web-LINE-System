# Google Sheets と LINE Webhook の統合

## 📋 セットアップ手順

### Step 1: Google Cloud プロジェクトの作成

1. https://console.cloud.google.com にアクセス
2. **プロジェクトを作成** をクリック
3. プロジェクト名: `LINE-Webhook`
4. **作成** をクリック

### Step 2: Google Sheets API を有効化

1. コンソールで **API とサービス** → **ライブラリ** を選択
2. `Google Sheets API` を検索
3. **有効にする** をクリック

### Step 3: サービスアカウント認証情報を作成

1. **API とサービス** → **認証情報** を選択
2. **認証情報を作成** → **サービスアカウント**
3. **サービスアカウント名:** `line-webhook`
4. **作成して続行**
5. (2番目のステップはスキップ可能)

### Step 4: キーを生成

1. 作成したサービスアカウントをクリック
2. **キー** タブ
3. **鍵を追加** → **新しい鍵を作成**
4. **JSON** を選択
5. **作成** をクリック
6. JSON ファイルがダウンロードされる

### Step 5: Google Sheet を共有

1. Google Sheet を開く
2. **共有** をクリック
3. ダウンロードした JSON の `client_email` をコピー
4. そのメールアドレスを編集者として追加

### Step 6: Sheet ID を確認

URL から Sheet ID を取得：
```
https://docs.google.com/spreadsheets/d/【SHEET_ID】/edit
```

`【SHEET_ID】` の部分がシート ID です

---

## 📝 Vercel への環境変数設定

### JSON ファイルの内容をコピー

ダウンロードした JSON ファイルの内容を Vercel に設定します

**Vercel Dashboard → Settings → Environment Variables**

以下を追加：

```
GOOGLE_SHEETS_ID = 1mRag8ph-cr54XEEY3nMinmXAoRYcxjgupLZrJsMYjao

GOOGLE_SERVICE_ACCOUNT_JSON = {
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## 🎯 実装概要

```
LINE メッセージ
    ↓
Webhook 受信 (/api/webhook)
    ↓
Google Sheets に追加
    ↓
✅ スプレッドシートに記録
```

---

## 💡 メリット

✅ データが永続的に保存される  
✅ Google Sheets で直接確認・編集できる  
✅ データベース代わりになる  
✅ 無料で使用できる  
✅ 自動バックアップ  

