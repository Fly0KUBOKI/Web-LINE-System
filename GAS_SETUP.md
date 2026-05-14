# Google Apps Script (GAS) セットアップガイド

## 📋 Google Cloud なし！シンプルなセットアップ

### Step 1: Google Sheet を作成または準備

1. [Google Drive](https://drive.google.com) を開く
2. 新しいスプレッドシートを作成（既存のものを使用してもOK）
3. 最初の行にヘッダーを作成:
   - A1: `タイムスタンプ`
   - B1: `ユーザーID`
   - C1: `メッセージタイプ`
   - D1: `テキスト`

### Step 2: Google Apps Script を開く

1. Google Sheet を開いている状態で、**拡張機能** → **Apps Script** をクリック
2. 新しいタブで Apps Script エディターが開きます

### Step 3: GAS コードを貼り付け

1. デフォルトの `function myFunction()` を選択して削除
2. [GAS_SCRIPT.gs](./GAS_SCRIPT.gs) の内容をすべてコピー
3. エディターに貼り付け
4. **Ctrl+S** (または **Cmd+S**) で保存

### Step 4: デプロイ

1. 上部の **デプロイ** ボタンをクリック
2. **新しいデプロイ** をクリック
3. **タイプを選択** → **ウェブアプリ** を選択
4. 以下のように設定:
   - **実行アカウント**: あなたの Google アカウント
   - **アクセス権**: 全員

5. **デプロイ** をクリック
6. **許可を求められたら** あなたのアカウントを許可

### Step 5: デプロイメント URL をコピー

デプロイ後、ダイアログに表示される **ウェブアプリの URL** をコピーします。

形式:
```
https://script.google.com/macros/d/【ID】/userweb
```

この URL が必要です！

### Step 6: Vercel に環境変数を設定

1. [Vercel Dashboard](https://vercel.com) にアクセス
2. `web-line-system` プロジェクトを選択
3. **Settings** → **Environment Variables** に進む
4. 新しい変数を追加:

   **変数名:**
   ```
   GAS_DEPLOYMENT_URL
   ```

   **値:**
   ```
   【Step 5 でコピーした URL】
   ```

5. 保存後、自動的に Vercel が再デプロイされます（1-2分待機）

---

## 🧪 セットアップ完了後のテスト

### 1. LINE メッセージを送信

実際の LINE アカウントから BOT にメッセージを送信

### 2. Google Sheet を確認

Google Sheet に新しい行が追加されているか確認

### 3. ダッシュボードを確認

https://web-line-system.vercel.app をリロード

統計情報が表示されているか確認

---

## 📊 データが Google Sheet に保存される流れ

```
LINE メッセージ
    ↓
Webhook 受信 (/api/webhook)
    ↓
GAS URL に POST
    ↓
GAS が Google Sheet に追加
    ↓
✅ Google Sheet に永続保存
    ↓
ダッシュボードが GAS から統計を取得
    ↓
web UI に表示
```

---

## 💡 メリット

✅ Google Cloud セットアップなし  
✅ サービスアカウント認証情報なし  
✅ 環境変数が最小限（1つだけ）  
✅ Google Sheet から直接データを確認・編集できる  
✅ データベース代わりになる  
✅ 無料で使用できる  
✅ 自動バックアップ  

---

## 🔧 GAS が壊れた場合の対応

### データは消えない

新しい GAS デプロイメントを作成しても、Google Sheet のデータは残ります。

### GAS を再デプロイ

1. Google Sheet → **拡張機能** → **Apps Script**
2. デプロイを削除して、新しいデプロイを作成
3. 新しい URL を Vercel に設定

---

## 📝 カスタマイズ

### Google Sheet の列を変更したい

GAS_SCRIPT.gs の以下の部分を編集:

```javascript
sheet.appendRow([
  timestamp,
  data.userId,
  data.messageType || 'text',
  data.text
]);
```

### 統計の計算方法を変更したい

GAS_SCRIPT.gs の `doGet` 関数を編集してください。

---

## 🚀 本番運用のヒント

1. **Google Sheet を共有**: チーム全体で見られるように共有設定を変更
2. **定期的なバックアップ**: Google Sheet を定期的にエクスポート
3. **複数の Sheet を使用**: 月ごと、ユーザーごとに分けるなど

