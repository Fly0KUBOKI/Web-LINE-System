# Webhook URL の確認方法

## 📍 Webhook URL はどこにあるのか

Vercel デプロイ後、以下の場所で Webhook URL を確認できます。

---

## 🔍 方法1: Vercel ダッシュボードで確認（最も簡単）

### Step 1: Vercel ダッシュボードにアクセス

```
https://vercel.com/dashboard
```

### Step 2: プロジェクトを選択

- **Web-LINE-System** プロジェクトをクリック

### Step 3: Deployment URL を確認

ページ上部に以下のような URL が表示されます:

```
🔗 https://web-line-system-abc123.vercel.app
```

### Step 4: Webhook URL を組み立てる

基本 URL + `/api/webhook`:

```
https://web-line-system-abc123.vercel.app/api/webhook
```

**これが LINE Developers に登録する Webhook URL です**

---

## 📸 スクリーンショット（ステップバイステップ）

### Vercel ダッシュボード画面

```
┌─────────────────────────────────────────────────────┐
│ Vercel ダッシュボード                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Projects                                          │
│  ├─ web-line-system  ✅ Deployed                   │
│  │  Production: https://web-line-system-abc123... │
│  │                                                 │
│  ✅ ここにデプロイ URL が表示される                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### プロジェクトページ

```
┌─────────────────────────────────────────────────────┐
│ web-line-system                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔗 Visit                                            │
│    https://web-line-system-abc123.vercel.app      │
│                                                     │
│ ← Deployments ← Domains ← Settings                │
│                                                     │
│ ✅ ここの URL が本体                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 URL の構造を理解する

Webhook URL は以下の構造です:

```
https://[プロジェクト名].vercel.app/api/webhook
       ↑                                ↑
       |                                |
   Vercel が発行           固定パス（変わらない）
    する URL
```

### 具体例

```
デプロイ URL:  https://web-line-system-abc123.vercel.app
Webhook URL:  https://web-line-system-abc123.vercel.app/api/webhook
              ↑ 同じ               ↑ 末尾に /api/webhook を追加
```

---

## ✅ LINE Developers に登録する URL

LINE Developers コンソールで:

### 1️⃣ Messaging API タブを開く

```
チャネル設定 → Messaging API
```

### 2️⃣ Webhook セクションを探す

下にスクロールすると:

```
┌─────────────────────────────────────────────────────┐
│ Webhook                                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Webhook URL                                        │
│ ┌──────────────────────────────────────────────┐  │
│ │ https://web-line-system-abc123.vercel.app   │  │
│ │         /api/webhook                         │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
│ ☑️ Webhook使用                                     │
│                                                     │
│ [更新]                                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3️⃣ URL を入力・更新

```
Webhook URL: https://web-line-system-abc123.vercel.app/api/webhook
```

### 4️⃣ 「Webhook使用」をチェック

☑️ のチェックを入れます

### 5️⃣ [更新] をクリック

---

## 🚨 よくあるミス

### ❌ 間違った URL

```
❌ https://web-line-system-abc123.vercel.app
   (末尾に /api/webhook がない)

❌ https://web-line-system-abc123.vercel.app/webhook
   (パスが間違っている)

❌ https://web-line-system-abc123.vercel.app/api/line/webhook
   (パスが間違っている)
```

### ✅ 正しい URL

```
✅ https://web-line-system-abc123.vercel.app/api/webhook
   (これが唯一正しいパス)
```

---

## 📋 チェックリスト

デプロイ後に以下を確認してください:

- [ ] Vercel ダッシュボードにプロジェクトが表示されている
- [ ] 「Production」ステータスが ✅ になっている
- [ ] Vercel が発行した URL をコピーした
- [ ] URL の末尾に `/api/webhook` を追加した
- [ ] LINE Developers に完全な URL を入力した
- [ ] 「Webhook使用」にチェックを入れた
- [ ] [更新] をクリックした

---

## 🔄 デプロイ後の流れ

```
1. GitHub にコードをプッシュ
   ↓
2. Vercel が自動デプロイを開始
   ↓
3. デプロイ完了 → URL が発行される
   ↓ ← あなたはここ
4. Vercel ダッシュボードで URL を確認
   ↓
5. LINE Developers に Webhook URL を登録
   ↓
6. LINE チャットでテスト
```

---

## 💡 Webhook URL を確認する別の方法

### 方法2: ブラウザで直接確認

1. Vercel から発行された URL を開く:
   ```
   https://web-line-system-abc123.vercel.app
   ```

2. ブラウザのアドレスバーで確認

3. 末尾に `/api/webhook` を追加したものが Webhook URL

### 方法3: コマンドラインで確認

```bash
# Vercel CLI をインストール
npm i -g vercel

# ログイン
vercel login

# プロジェクト情報を確認
vercel ls

# または直接確認
vercel inspect --production
```

---

## 🎯 まとめ

**Webhook URL を確認する手順**:

1. **Vercel ダッシュボードにアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトをクリック**
   ```
   Web-LINE-System
   ```

3. **表示されている URL を確認**
   ```
   https://web-line-system-abc123.vercel.app
   ```

4. **末尾に `/api/webhook` を追加**
   ```
   https://web-line-system-abc123.vercel.app/api/webhook
   ```

5. **これを LINE Developers に登録**

---

## 📞 Webhook URL が見つからない場合

### デプロイが完了していないかもしれません

**確認方法**:

1. Vercel ダッシュボード → **Deployments** タブ
2. 最新デプロイのステータスを確認
3. ステータスが ✅ **Ready** になるまで待機

```
Latest Deployment: ✅ Ready
Production: https://web-line-system-abc123.vercel.app
```

### デプロイが失敗している場合

```
❌ Failed
```

という表示になっていたら:

1. デプロイをクリック
2. **Logs** タブを確認
3. エラーメッセージを確認
4. 環境変数が正しく設定されているか確認

---

**次のステップ**: Webhook URL を LINE Developers に登録してテストを実施してください！

