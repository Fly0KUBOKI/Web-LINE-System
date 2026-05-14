# Webhook メッセージが反映されない場合のトラブルシューティング

## ✅ チェックリスト

### 1. LINE Developers で Webhook URL が正しく設定されているか

**確認手順:**
1. https://developers.line.biz にアクセス
2. 該当のチャネルを選択
3. **Messaging API** → **Webhook URL** を確認

**正しい設定:**
```
https://web-line-system.vercel.app/api/webhook
```

### 2. Webhook 使用設定が有効になっているか

**確認手順:**
1. Messaging API 画面
2. **Webhook 使用設定** を探す
3. トグルが **有効** になっているか確認

### 3. 環境変数が Vercel に設定されているか

**確認手順:**
1. Vercel Dashboard → web-line-system プロジェクト
2. Settings → Environment Variables
3. 以下の2つが存在するか確認：
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_WEBHOOK_SECRET`

**重要:** 環境変数を追加/変更した場合、**Vercel が自動的に再デプロイされます**（1-2分待機）

### 4. メッセージをもう一度送ってみる

LINE BOT にメッセージを送信してから、ダッシュボードをリロード

### 5. 実際のログを確認

Vercel のログを確認するには：

1. Vercel Dashboard → web-line-system
2. **Deployments** タブ
3. 最新のデプロイを選択
4. **Runtime logs** または **Build logs** を確認

---

## 🔍 問題別対応

### メッセージ送信直後は反映されるが、すぐに消える

**原因:** Vercel Serverless Functions のメモリが持続しない

**解決:** データベース（MongoDB、Firebase など）を統合する必要があります

### メッセージが全く反映されない

**原因:** Webhook が LINE から呼ばれていない

**確認項目:**
- [ ] Webhook URL が正しく設定されているか
- [ ] Webhook 使用設定が有効か
- [ ] 環境変数が正しく設定されているか
- [ ] デプロイが完全に反映されているか（2-3分待機）

---

## 📝 デバッグ手順

### 1. テスト Webhook を実行

ローカルからテストメッセージを送信：

```bash
docker compose run --rm line-test node test-vercel-prod.js
```

結果が **✅ 成功** なら、Webhook サーバーは正常です

### 2. Webhook URL をテスト

LINE Developers の画面で **「テスト」** ボタンをクリック

結果: **Status 200** が返ることを確認

### 3. ダッシュボードをリロード

```
https://web-line-system.vercel.app
```

---

## 🔧 一般的な問題と解決法

| 問題 | 原因 | 解決方法 |
|------|------|--------|
| Webhook URL が404 | ルーティング設定がない | Vercel 設定を確認 |
| 401 Unauthorized | 署名検証が失敗 | 環境変数が正しいか確認 |
| メッセージが反映されない | Webhook が呼ばれていない | LINE Developers で設定を確認 |
| メッセージがすぐ消える | メモリに保存している | データベースを統合 |

---

## 💡 ベストプラクティス

本番運用では以下をお勧めします：

1. **データベース統合** - MongoDB, Firebase など
2. **ログ監視** - Sentry, DataDog など
3. **エラー通知** - Slack 連携など
4. **定期バックアップ** - メッセージ履歴を保護

