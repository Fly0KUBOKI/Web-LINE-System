# Vercel デプロイ & Webhook 設定ガイド

## 📋 概要

このプロジェクトは **Vercel** にデプロイして、LINE Messaging API と統合します。

```
ユーザー (LINE チャット)
    ↓
Vercel Webhook: /api/webhook
    ↓
LINE Messaging API
```

---

## 🚀 デプロイ手順

### Step 1: GitHub リポジトリを作成

```bash
# GitHub で新しいリポジトリを作成
# 例: https://github.com/your-username/line-api-dashboard
```

### Step 2: ローカルでコードをプッシュ

```bash
cd web
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/line-api-dashboard.git
git push -u origin main
```

### Step 3: Vercel にサインアップ

1. https://vercel.com を開く
2. 「Sign Up」をクリック
3. GitHub でログイン

### Step 4: Vercel でプロジェクト作成

1. Vercel ダッシュボード → 「New Project」
2. GitHub リポジトリ `line-api-dashboard` を選択
3. インポート

### Step 5: 環境変数を設定

プロジェクト設定 → **Environment Variables** に以下を追加:

| キー | 値 |
|-----|-----|
| `LINE_CHANNEL_ACCESS_TOKEN` | `Tg4fGKd6CZOvQfP2puDuCEw3Uc0I2+g7gK4fG1LSYlOkh81bM6ITQ/PSPV9ibSxrO22U2SKYUcvCGWaUh/qlJuoow11prngfmUwohCepyFLcKWn8fFrzAn+CL5l4w+RUqrwaEjVw/4QKptPaf7nm9QdB04t89/1O/w1cDnyilFU=` |
| `LINE_WEBHOOK_SECRET` | `3526c26065e15966c435e35b91b6e674` |
| `VITE_LINE_USER_ID` | `U37cbb8df484561fb3666066d719d4672` |

✅ **デプロイ完了** → URL が表示されます

```
https://your-project-name.vercel.app
```

---

## 🔗 LINE Developers で Webhook を設定

### 1. LINE Developers コンソールにアクセス

https://developers.line.biz/ja/

### 2. チャネル設定を開く

1. プロバイダー → **LINE API テスト** を選択
2. **Messaging API** タブをクリック
3. 下部の **Webhook** セクションを探す

### 3. Webhook URL を設定

```
https://your-project-name.vercel.app/api/webhook
```

例:
```
https://line-dashboard-abc123.vercel.app/api/webhook
```

### 4. Webhook 使用状態を ON に

✅ トグルを ON に切り替える

---

## 📱 テスト方法

### 1. ボットにメッセージを送信

LINE チャット内で:
```
統計
```

### 2. 応答を確認

```
[STATS] 統計情報:
送信数: 1
ユーザー数: 1
```

### 3. ボタンをテスト

確認メッセージ送信 API を呼び出して、ボタンをクリック:

```bash
curl -X POST https://your-project-name.vercel.app/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U37cbb8df484561fb3666066d719d4672",
    "messages": [
      {
        "type": "text",
        "text": "テストメッセージ"
      }
    ]
  }'
```

---

## 🔧 トラブルシューティング

### Webhook が受信されない

**原因 1**: Webhook URL が正しくない
```
❌ https://your-project-name.vercel.app/webhook
✅ https://your-project-name.vercel.app/api/webhook
```

**原因 2**: 環境変数が設定されていない
- Vercel → プロジェクト設定 → Environment Variables を確認

**原因 3**: Webhook 使用状態が OFF
- LINE Developers コンソール → Messaging API → Webhook トグルを ON に

### デプロイエラーが出ている

```bash
# ローカルでビルドを確認
npm run build

# エラーメッセージを Vercel ダッシュボードで確認
# → Deployments タブ → 最新デプロイをクリック
```

---

## 📊 API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| `POST` | `/api/webhook` | LINE Webhook 受け取り（自動） |
| `POST` | `/api/send-message` | メッセージ送信 |
| `GET` | `/api/profile?userId=...` | ユーザー情報取得 |
| `GET` | `/api/stats` | 統計情報取得 |

---

## 🌐 Web UI にアクセス

```
https://your-project-name.vercel.app
```

以下の機能が利用可能:
- 📊 **ダッシュボード**: ユーザープロフィール表示
- 💬 **メッセージ送信**: テキストメッセージを送信
- 📈 **データ分析**: グラフでメッセージ統計を表示

---

## 💡 本番環境での推奨事項

1. **データベース連携**
   - メッセージをメモリではなく DB に保存
   - 推奨: MongoDB、PostgreSQL など

2. **セキュリティ強化**
   - API キーを `.env.local` で管理（Git に含めない）
   - HTTPS のみを使用（Vercel は自動対応）

3. **ログ監視**
   - Vercel Analytics でトラフィックを監視
   - ログを CloudWatch など外部サービスに送信

4. **エラーハンドリング**
   - Sentry など Error Tracking サービスを導入

---

## 📚 参考リンク

- [Vercel ドキュメント](https://vercel.com/docs)
- [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/)
- [LINE Webhook](https://developers.line.biz/ja/docs/messaging-api/handling-webhook-events/)

---

**最終更新**: 2026-05-14  
**バージョン**: 1.0
