# Web-LINE-System

LINE Messaging API を活用した Web ベースのチャットボットダッシュボードシステム

![GitHub](https://img.shields.io/badge/GitHub-Fly0KUBOKI%2FWeb--LINE--System-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-success)

## 📋 概要

このプロジェクトは、LINE Messaging API を使ってメッセージの送受信、データ分析、自動応答を実現するシステムです。

### 主な機能

| 機能 | 説明 |
|------|------|
| **📨 メッセージ送受信** | LINE でテキストメッセージを送信・受信 |
| **🔘 ボタン応答処理** | テンプレートメッセージのボタンをクリックして自動実行 |
| **📊 データ分析** | メッセージ統計・グラフ表示 |
| **🤖 自動応答** | キーワード判定による自動返信 |
| **🌐 Web ダッシュボード** | React + Vercel で Web UI を提供 |
| **⚡ Serverless API** | Vercel Functions で Webhook 処理 |

---

## 🏗️ プロジェクト構成

```
Web-LINE-System/
├── web/                          # React + Vite プロジェクト
│   ├── src/
│   │   ├── components/           # React コンポーネント
│   │   │   ├── Layout.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SendMessage.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── MessageStoreContext.tsx
│   │   ├── lib/
│   │   │   ├── lineApi.ts        # LINE API クライアント
│   │   │   └── analytics.ts      # データ分析ロジック
│   │   ├── types/
│   │   │   └── line.ts           # TypeScript 型定義
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── api/                      # Vercel Functions (Serverless API)
│   │   ├── webhook.ts            # LINE Webhook 受信
│   │   ├── send-message.ts       # メッセージ送信
│   │   ├── profile.ts            # ユーザー情報取得
│   │   ├── rich-menus.ts         # リッチメニュー取得
│   │   └── stats.ts              # 統計情報取得
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── VERCEL_SETUP.md           # Vercel デプロイガイド
│
├── src/                          # Node.js バックエンド（開発用）
│   ├── lineClient.js             # LINE APIクライアント
│   ├── dataAnalyzer.js           # データ分析エンジン
│   ├── test.js                   # テストプログラム
│   ├── webhook.js                # Webhook サーバー
│   └── webhook-test.js           # Webhook テスト
│
├── Dockerfile                    # Docker イメージ定義
├── docker-compose.yml            # Docker Compose 設定
├── package.json
├── requirements.txt              # Python 依存関係
├── data_analyzer.py              # Python データ分析
├── line_client.py                # Python LINE クライアント
├── test.py                       # Python テスト
├── webhook_server.py             # Python Webhook サーバー
├── WEBHOOK_SETUP.md              # Webhook セットアップガイド
└── README.md                     # このファイル
```

---

## 🚀 クイックスタート

### 方法1: Docker を使用（推奨）

```bash
# 依存関係をインストール
docker compose build

# Webhook サーバーを起動
docker compose up line-webhook -d

# テストを実行
docker compose run --rm line-test
```

### 方法2: Node.js で実行

```bash
# 依存関係をインストール
npm install

# Webhook サーバーを起動
npm run webhook

# テストを実行
npm test
```

### 方法3: Python で実行

```bash
# 依存関係をインストール
pip install -r requirements.txt

# テストを実行
python test.py

# Webhook サーバーを起動
python webhook_server.py
```

---

## 📦 インストール

### 前提条件

- Node.js 18+ または Python 3.9+
- Docker & Docker Compose（推奨）
- LINE Developers アカウント
- GitHub アカウント

### セットアップ

1. **リポジトリをクローン**

```bash
git clone https://github.com/Fly0KUBOKI/Web-LINE-System.git
cd Web-LINE-System
```

2. **環境変数を設定**

```bash
cp .env.example .env
```

`.env` を編集して以下を入力:

```
LINE_CHANNEL_ID=2009935281
LINE_CHANNEL_ACCESS_TOKEN=your_token_here
LINE_WEBHOOK_SECRET=your_secret_here
USER_ID=U37cbb8df484561fb3666066d719d4672
PORT=3000
```

3. **Docker で実行**

```bash
docker compose up -d
```

---

## 🌐 Vercel へのデプロイ

### Step 1: GitHub にプッシュ

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Vercel にサインアップ・連携

1. https://vercel.com にアクセス
2. GitHub でサインアップ
3. 「New Project」をクリック
4. このリポジトリを選択

### Step 3: 環境変数を設定

Vercel プロジェクト設定 → Environment Variables:

| キー | 値 |
|-----|-----|
| `LINE_CHANNEL_ACCESS_TOKEN` | (LINE Developers から) |
| `LINE_WEBHOOK_SECRET` | (LINE Developers から) |
| `VITE_LINE_USER_ID` | (ユーザーID) |

### Step 4: LINE Developers で Webhook を登録

```
https://your-project-name.vercel.app/api/webhook
```

詳細は [VERCEL_SETUP.md](web/VERCEL_SETUP.md) を参照

---

## 📝 使用方法

### Web ダッシュボード

```
https://your-project-name.vercel.app
```

**ページ一覧**:
- **ダッシュボード**: ユーザー情報・メッセージ統計
- **メッセージ送信**: テキストメッセージを送信
- **データ分析**: グラフでメッセージを分析

### LINE でのやり取り

1. ボットをフォロー
2. メッセージを送信
3. 自動応答が返されます

**キーワード例**:
```
"統計" → 統計情報を表示
"ヘルプ" → コマンド一覧を表示
"リセット" → データをリセット
```

---

## 🔧 API リファレンス

### Webhook エンドポイント

**受信イベント**:
- `message` - テキストメッセージ
- `postback` - ボタンクリック応答
- `follow` - フォロー
- `unfollow` - フォロー解除

### メッセージ送信 API

```bash
curl -X POST /api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U...",
    "messages": [
      { "type": "text", "text": "Hello" }
    ]
  }'
```

### ユーザープロフィール API

```bash
curl -X GET "/api/profile?userId=U..."
```

### 統計情報 API

```bash
curl -X GET /api/stats
```

---

## 📊 テスト

### 自動テスト

```bash
# Docker を使用
docker compose run --rm line-test

# Node.js を使用
npm run test

# Python を使用
python test.py
```

### Webhook テスト

```bash
# Webhook シミュレーター
node src/webhook-test.js
```

---

## 🛠️ トラブルシューティング

### Webhook が受信されない

1. **Webhook URL が正しいか確認**
   ```
   ✅ https://your-project-name.vercel.app/api/webhook
   ❌ https://your-project-name.vercel.app/webhook
   ```

2. **LINE Developers で Webhook が ON か確認**
   - Messaging API → Webhook

3. **環境変数が設定されているか確認**
   - Vercel → Project Settings → Environment Variables

### メッセージが返ってこない

1. **アクセストークンが有効か確認**
2. **ボットをフォローしているか確認**
3. **ユーザーID が正しいか確認**

---

## 📚 ドキュメント

- [Webhook セットアップガイド](WEBHOOK_SETUP.md)
- [Vercel デプロイガイド](web/VERCEL_SETUP.md)
- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)

---

## 🤝 貢献

プルリクエストを歓迎します！

1. フォークしてくださ い
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. コミット (`git commit -m 'Add some AmazingFeature'`)
4. プッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

---

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

## 👨‍💻 作者

**Fly0KUBOKI**

- GitHub: [@Fly0KUBOKI](https://github.com/Fly0KUBOKI)
- Email: s247848x@st.go.tuat.ac.jp

---

## 🔗 関連リソース

- [LINE Messaging API](https://developers.line.biz/ja/)
- [Vercel](https://vercel.com/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker](https://www.docker.com/)

---

**最終更新**: 2026-05-14  
**バージョン**: 1.0.0

