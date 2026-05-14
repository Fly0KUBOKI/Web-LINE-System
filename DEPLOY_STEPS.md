# Vercel デプロイ手順書

GitHub へのプッシュが完了しました。次のステップで Vercel にデプロイします。

## 📋 確認事項

✅ コード: GitHub にプッシュ完了  
✅ リポジトリ: https://github.com/Fly0KUBOKI/Web-LINE-System  
✅ README.md: 完備  
✅ 環境変数テンプレート: `.env.example` を提供

---

## 🚀 Vercel デプロイ手順

### Step 1: Vercel にサインアップ

1. https://vercel.com を開く
2. **Sign Up** をクリック
3. **GitHub でログイン** を選択
4. 認可を承認

### Step 2: プロジェクトをインポート

1. Vercel ダッシュボード → **Add New...** → **Project**
2. **Import Git Repository** をクリック
3. 検索欄で `Web-LINE-System` を入力
4. リポジトリを選択して **Import**

### Step 3: プロジェクト設定

**Framework Preset**: `Other` または自動選択

**Root Directory**: `web/` を指定

**Environment Variables** を設定:

| キー | 値 | 説明 |
|-----|-----|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | `Tg4fGKd6CZOvQfP2puDuCEw3Uc0I2+g7gK4fG1LSYlOkh81bM6ITQ/PSPV9ibSxrO22U2SKYUcvCGWaUh/qlJuoow11prngfmUwohCepyFLcKWn8fFrzAn+CL5l4w+RUqrwaEjVw/4QKptPaf7nm9QdB04t89/1O/w1cDnyilFU=` | LINE チャネルアクセストークン |
| `LINE_WEBHOOK_SECRET` | `3526c26065e15966c435e35b91b6e674` | Webhook 署名シークレット |
| `VITE_LINE_USER_ID` | `U37cbb8df484561fb3666066d719d4672` | ユーザーID |

### Step 4: デプロイ実行

**Deploy** をクリック → デプロイ開始

デプロイ完了後、以下の形式で URL が発行されます:

```
https://[project-name].vercel.app
```

例:
```
https://web-line-system.vercel.app
```

---

## 🔗 LINE Developers で Webhook を登録

デプロイ完了後、以下のステップで LINE に Webhook URL を登録します。

### 1. LINE Developers にアクセス

https://developers.line.biz/ja/

### 2. チャネル設定を開く

1. プロバイダー選択 → **LINE API テスト**
2. **Messaging API** タブをクリック

### 3. Webhook URL を設定

「Webhook」セクションで:

```
Webhook URL = https://[your-project-name].vercel.app/api/webhook
```

例:
```
https://web-line-system.vercel.app/api/webhook
```

### 4. Webhook 使用状態を ON

トグルを **ON** に切り替え

### 5. アクセストークンを確認

**チャネル アクセストークン** が以下と一致するか確認:
```
Tg4fGKd6CZOvQfP2puDuCEw3Uc0I2+g7gK4fG1LSYlOkh81bM6ITQ/PSPV9ibSxrO22U2SKYUcvCGWaUh/qlJuoow11prngfmUwohCepyFLcKWn8fFrzAn+CL5l4w+RUqrwaEjVw/4QKptPaf7nm9QdB04t89/1O/w1cDnyilFU=
```

---

## ✅ テスト実施

### 1. Web UI にアクセス

```
https://[your-project-name].vercel.app
```

**確認項目**:
- [ ] ページが正常に表示される
- [ ] ダッシュボードが表示される
- [ ] メッセージ送信ページにアクセスできる

### 2. LINE でメッセージを送信

1. ボットをフォロー
2. テキストを送信
3. 応答が返ってくるか確認

**テスト例**:
```
送信: "統計"
期待: [STATS] 統計情報: ... 
```

### 3. ボタン応答をテスト

LINE で以下のメッセージが表示されるか確認:
```
テストアンケート
「このテストは成功していますか?」

[はい] [いいえ]
```

ボタンをクリックして応答が返されるか確認

---

## 🔍 デバッグ

### Vercel のログを確認

1. Vercel ダッシュボード → プロジェクト選択
2. **Deployments** → 最新デプロイをクリック
3. **Logs** で実行ログを確認

### LINE API エラーを確認

環境変数が正しく設定されているか確認:

```bash
# Vercel ダッシュボード → Project Settings → Environment Variables
```

---

## 🚨 よくある問題

### "Cannot find module" エラー

**原因**: `web/` ディレクトリが認識されていない

**解決**: Vercel で Root Directory を `web/` に設定

### Webhook が受信されない

**原因 1**: Webhook URL が間違っている
- ✅ `/api/webhook` 
- ❌ `/webhook`

**原因 2**: 環境変数が設定されていない
- Vercel → Project Settings → Environment Variables を確認

**原因 3**: LINE Developers で Webhook が OFF
- Messaging API → Webhook トグルを確認

---

## 📞 サポート

問題が発生した場合は:

1. Vercel ダッシュボードのログを確認
2. LINE Developers コンソールを確認
3. [GitHub Issues](https://github.com/Fly0KUBOKI/Web-LINE-System/issues) を確認

---

**次のステップ**: Webhook URL を LINE に登録してテスト実施

Good luck! 🚀
