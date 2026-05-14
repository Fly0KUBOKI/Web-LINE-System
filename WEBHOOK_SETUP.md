# LINE Webhook 設定ガイド

## 現在の状態

✅ **Webhook サーバー**: Docker で実行中（ポート 3000）  
✅ **ボタン応答処理**: postback イベント対応済み  
✅ **テキスト処理**: キーワード判定機能実装済み  

## LINE Developers での設定手順

### 1. Webhook URL の設定

**LINE Developers Console** にアクセス:
- https://developers.line.biz/ja/

1. チャネル選択 → **Messaging API タブ**
2. 下部の **Webhook** セクション を探す
3. **Webhook URL** に以下を入力:

```
https://your-domain.com/webhook
```

**注意**: ローカル環境でテストする場合は、トンネリングツールを使用:
```bash
# ngrok の例
ngrok http 3000
# → https://xxxx-xxxx-xxxx.ngrok.io/webhook
```

### 2. Webhook 署名シークレット確認

```
LINE_WEBHOOK_SECRET = 3526c26065e15966c435e35b91b6e674
```

### 3. Webhook 使用状態の確認

✅ ON に設定されているか確認

---

## メッセージ種別の処理

### テキストメッセージ

ユーザーが通常のテキストを送信した場合:

```
ユーザー: "こんにちは"
↓
Webhook: message イベント受信
↓
処理: 
  - キーワード判定 ("統計", "ヘルプ", "リセット" など)
  - データベースに記録
  - 自動応答を送信
```

**対応キーワード**:
- `統計` / `分析` → 統計情報を表示
- `ヘルプ` / `help` → コマンド一覧を表示
- `リセット` → データをリセット
- その他 → エコーバック応答

### ボタン応答 (postback)

ユーザーがボタンを押した場合:

```
ユーザー: [はい] ボタンを押す
↓
Webhook: postback イベント受信
↓ postback.data = "action=yes&user_id=U37cbb..."
↓
処理:
  - アクション値を解析 (action=yes)
  - 対応するラベル ("はい") をデータに記録
  - 適切な応答を送信
```

**対応アクション**:
- `action=yes` → "はい" と記録 → 確認応答
- `action=no` → "いいえ" と記録 → 情報応答
- `action=save` → "保存" と記録 → 保存完了応答
- `action=cancel` → "キャンセル" と記録 → キャンセル応答

---

## テスト方法

### 方法1: LINE チャットで直接送信

1. ボットをフォロー
2. メッセージ送信
3. ボタンをクリック
4. Webhook サーバーのログでイベント受信を確認

```bash
docker logs line-webhook-server -f
```

### 方法2: 統計情報を確認

```bash
# ブラウザで以下にアクセス:
http://localhost:3000/stats

# 結果例:
{
  "totalMessages": 10,
  "uniqueUsers": 1,
  "totalChars": 150,
  "averageLength": 15,
  "userStats": [...]
}
```

---

## トラブルシューティング

### Webhook が受信されない

1. **Webhook URL が正しいか確認**
   - LINE Developers コンソール → Messaging API → Webhook URL

2. **ボットがフォローされているか確認**
   - ボットをフォローしてからメッセージを送信

3. **署名検証が失敗していないか確認**
   - ログで `[NG] 無効な署名です` が出ていないか確認
   - `LINE_WEBHOOK_SECRET` が正しいか確認

4. **ファイアウォール設定を確認**
   - ポート 3000 が外部からアクセス可能か確認
   - ngrok など使用時は URL が正しいか確認

### メッセージは受信されるが応答がない

1. **LINE API アクセストークンが有効か確認**
   - `.env` の `LINE_CHANNEL_ACCESS_TOKEN` を確認

2. **ユーザーID が正しいか確認**
   - プロフィール取得で確認: `http://localhost:3000/stats`

3. **ボット が有効か確認**
   - LINE Developers コンソール → チャネル設定

---

## Docker コマンド

```bash
# Webhook サーバーを起動
docker compose up line-webhook -d

# ログを確認
docker logs line-webhook-server -f

# サーバーを停止
docker compose down

# テストプログラムを実行
docker compose run --rm line-test
```

---

## 次のステップ

1. **Web UI (React) をデプロイ**
   - Vercel にプッシュして自動デプロイ

2. **データベース連携**
   - MongoDB や PostgreSQL とメッセージを同期

3. **高度な機能追加**
   - NLP による感情分析
   - 定期通知機能
   - グループチャット対応

---

**作成日**: 2026-05-14  
**バージョン**: 1.0  
**対応API**: LINE Messaging API v2
