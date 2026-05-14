#!/bin/bash
set -e

cd /app

# Vercel CLI をインストール
npm install -g vercel

# Vercel にログイン（トークンを使用）
if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: VERCEL_TOKEN environment variable is not set"
  exit 1
fi

# Vercel にデプロイ
vercel deploy --token=$VERCEL_TOKEN --prod

echo "Deployment complete!"
