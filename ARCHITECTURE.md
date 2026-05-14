# LINE Webhook システム - アーキテクチャ

## 現在の実装

```
┌─────────────────────┐
│  LINE Platform      │
│  (ユーザーメッセージ)   │
└──────────┬──────────┘
           │ Webhook POST
           ↓
┌─────────────────────────────────────┐
│  Vercel Serverless Function         │
│  /api/webhook                       │
│  ├─ 署名検証                         │
│  ├─ メッセージ処理                   │
│  ├─ メモリに保存 ⚠️ (持続しない)     │
│  └─ LINE API へ返信                 │
└─────────────────────────────────────┘
           │
           ├→ メモリ (リクエスト後に削除)
           └→ LINE API メッセージ送信
```

## 🔴 問題点

### Vercel Serverless Functions の特性

1. **各リクエストで新しいプロセスが起動される**
   - リクエストが終了するとプロセスも終了
   - メモリの内容は失われる

2. **メッセージストアがリセットされる**
   ```javascript
   // これはリクエスト内でのみ有効
   let messageStore = [];  // リクエスト終了後に失われる
   ```

3. **ダッシュボードが常に空のデータを取得**
   ```json
   {
     "totalMessages": 0,
     "uniqueUsers": 0,
     "userStats": []
   }
   ```

---

## ✅ 解決策 (複数オプション)

### 方法1: Vercel KV (Redis) を使用 ⭐推奨

**利点:**
- Vercel と統合
- セットアップが簡単
- リクエスト間でデータが保持される
- 無料枠あり

**実装例:**
```javascript
import { kv } from '@vercel/kv';

// メッセージを保存
await kv.lpush('messages', { userId, text, timestamp });

// メッセージを取得
const messages = await kv.lrange('messages', 0, -1);
```

### 方法2: MongoDB / Firebase を使用

**利点:**
- スケーラビリティが高い
- 複雑なクエリが可能
- バックアップ機能が充実

**実装例 (Firebase):**
```javascript
const db = initializeApp(config).firestore();
await db.collection('messages').add({ userId, text, timestamp });
```

### 方法3: PostgreSQL / Supabase を使用

**利点:**
- 信頼性が高い
- SQL クエリが使える
- 無料オプションあり (Supabase)

---

## 推奨: Vercel KV の統合

### セットアップ手順

1. **Vercel Dashboard で KV を有効化**
   - Settings → Storage
   - Vercel KV を作成

2. **環境変数が自動で設定される**
   ```
   KV_URL=redis://...
   KV_REST_API_URL=...
   KV_REST_API_TOKEN=...
   ```

3. **コード修正**
   ```bash
   npm install @vercel/kv
   ```

4. **api/webhook.js を修正**
   ```javascript
   import { kv } from '@vercel/kv';

   // メッセージを保存
   await kv.lpush('messages', JSON.stringify({ userId, text, timestamp }));
   ```

5. **api/stats.js を修正**
   ```javascript
   import { kv } from '@vercel/kv';

   // メッセージを取得
   const messages = await kv.lrange('messages', 0, -1);
   ```

---

## 現在の制限事項

⚠️ **現在のシステムは以下の制限があります:**

1. メッセージはメモリに保存されるため、Vercel の再デプロイで削除される
2. ダッシュボードはリアルタイム表示ですが、新しいデプロイ後は0にリセット
3. 本番運用には**必ずデータベース統合が必要**

---

## 推奨される本番構成

```
┌─────────────────────┐
│  LINE Platform      │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────┐
│  Vercel Serverless Function │
└──────────┬──────────────────┘
           │
      ┌────┴─────┬───────────────┐
      ↓          ↓               ↓
   Webhook  Message Store   LINE API
   処理      (Vercel KV      返信
            または DB)
```

---

## 次のステップ

推奨する優先順位:

1. **すぐに実施**: Vercel KV を統合（15分程度）
2. **本番前**: 本格的なデータベース統合
3. **オプション**: ログ監視、エラー通知、バックアップ

