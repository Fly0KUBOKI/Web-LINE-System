# Docker 環境構築ガイド

## 1. Docker インストール

OS ごとにインストール方法が異なります。詳しくは [https://docker.com/get-started/](https://docker.com/get-started/) の公式ドキュメントを参照してください。

### Windows の場合
- **Docker Desktop for Windows** をダウンロード・インストール
- Windows 11 Home は WSL2 バックエンド を使用
- インストール後、PC を再起動

### macOS の場合
- **Docker Desktop for Mac** をダウンロード・インストール
- インストール後、再起動

### Linux の場合
- パッケージマネージャーまたは Docker 公式リポジトリから install

---

## 2. Docker インストール確認

インストール完了後、以下のコマンドでバージョン確認：

```bash
docker --version
docker run hello-world
```

---

## 3. Node.js イメージの確認

このプロジェクトは **Node.js 24-slim** を使用しています：

```bash
# イメージを取得
docker pull node:24-slim

# コンテナーを起動してシェルで動作確認
docker run -it --rm --entrypoint sh node:24-slim

# コンテナー内で以下を実行：
node -v    # v24.15.0 が表示される
npm -v     # 11.12.1 が表示される
exit       # コンテナーを終了
```

---

## 4. Python イメージの確認

このプロジェクトは **Python 3.12-slim** を使用しています：

```bash
# イメージを取得
docker pull python:3.12-slim

# コンテナーを起動してシェルで動作確認
docker run -it --rm --entrypoint sh python:3.12-slim

# コンテナー内で以下を実行：
python --version   # Python 3.12.x が表示される
pip --version      # pip 24.x が表示される
exit               # コンテナーを終了
```

---

## 5. プロジェクトで Docker を使う

### Webhookサーバー（Node.js）を起動
```bash
docker compose up line-webhook
```

**出力例:**
```
line-webhook-server  | 🚀 LINE Webhook サーバーが起動しました
line-webhook-server  |    ポート: 3000
line-webhook-server  |    Webhookエンドポイント: http://localhost:3000/webhook
```

### Pythonスクリプトを実行
```bash
docker compose run --rm --profile python line-python
```

### テストを実行
```bash
docker compose run --rm --profile test line-test
```

### イメージをビルドしなおす
```bash
docker compose build
```

### すべてのコンテナーを停止
```bash
docker compose down
```

---

## 6. トラブルシューティング

### イメージが見つからない場合
```bash
docker pull node:24-slim
docker pull python:3.12-slim
```

### コンテナーが起動しない場合
```bash
# ログを確認
docker compose logs line-webhook

# 強制削除してリセット
docker compose down -v
docker compose build --no-cache
docker compose up line-webhook
```

### ディスク容量が足りない場合
```bash
# 不要なイメージやコンテナーをクリーンアップ
docker system prune -a
```

---

## サービス構成

| サービス | 言語 | 用途 | イメージ |
|---|---|---|---|
| `line-webhook` | Node.js | LINEウェブフック受信 | `node:24-slim` |
| `line-python` | Python | データ解析・スクリプト実行 | `python:3.12-slim` |
| `line-test` | Node.js | テスト実行 | `node:24-slim` |

