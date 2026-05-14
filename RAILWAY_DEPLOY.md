# Railway へのデプロイ手順

Vercel より設定が簡単な Railway にデプロイします。

## 📋 Railway とは

- Docker コンテナをそのまま実行可能
- 環境変数の管理が簡単
- Webhook に最適

## 🚀 デプロイ手順

### Step 1: Railway にサインアップ

1. https://railway.app にアクセス
2. **GitHub でサインアップ**
3. 認可を許可

### Step 2: 新しいプロジェクトを作成

1. Dashboard → **New Project**
2. **Deploy from GitHub**
3. `Fly0KUBOKI/Web-LINE-System` リポジトリを選択

### Step 3: Dockerfile を設定

Railway は自動的に Dockerfile を検出します。

確認:
```
Service: web-line-system
Dockerfile: ./Dockerfile
```

### Step 4: 環境変数を設定

Project → **Variables** で以下を追加:

```
LINE_CHANNEL_ID=2009935281
LINE_CHANNEL_ACCESS_TOKEN=Tg4fGKd6CZOvQfP2puDuCEw3Uc0I2+g7gK4fG1LSYlOkh81bM6ITQ/PSPV9ibSxrO22U2SKYUcvCGWaUh/qlJuoow11prngfmUwohCepyFLcKWn8fFrzAn+CL5l4w+RUqrwaEjVw/4QKptPaf7nm9QdB04t89/1O/w1cDnyilFU=
LINE_WEBHOOK_SECRET=3526c26065e15966c435e35b91b6e674
PORT=3000
```

### Step 5: デプロイ実行

**Deploy** をクリック

デプロイ完了後、以下のような URL が発行されます:

```
https://web-line-system.up.railway.app
```

### Step 6: LINE Developers で Webhook URL を登録

```
Webhook URL: https://web-line-system.up.railway.app/webhook
```

---

## ✅ テスト

### 1. Webhook テスト

LINE Developers → Messaging API → Webhook → [テスト]

期待:
```
✅ ステータス: 200
```

### 2. LINE でメッセージ送信

```
送信: "こんにちは"
期待: [OK] "こんにちは" をありがとうございます
```

---

## 💡 Railway の利点

- ✅ Docker のサポートが完全
- ✅ 環境変数の管理が簡単
- ✅ ポート設定が不要（自動割り当て）
- ✅ Webhook に最適

