const express = require('express')
const crypto = require('crypto')
require('dotenv').config()

const app = express()
app.use(express.json())

// メッセージストア
const messageStore = []

// Webhook 署名検証
function validateSignature(body, signature) {
  const secret = process.env.LINE_WEBHOOK_SECRET || ''
  const hash = crypto.createHmac('sha256', secret).update(body).digest('base64')
  return hash === signature
}

// LINE にメッセージ送信
async function sendMessage(userId, text) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    console.error('[ERROR] LINE_CHANNEL_ACCESS_TOKEN not set')
    return
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'text', text }],
      }),
    })

    if (!response.ok) {
      console.error(`[ERROR] Failed to send message: ${response.status}`, await response.text())
    }
  } catch (error) {
    console.error('[ERROR]', error.message)
  }
}

// Webhook エンドポイント
app.post('/webhook', async (req, res) => {
  try {
    // 即座に 200 OK を返す（LINE プラットフォームの要件）
    res.status(200).json({ status: 'ok' })

    // イベント処理を非同期で実行
    const events = req.body.events || []

    for (const event of events) {
      console.log(`[EVENT] ${event.type}`)

      if (event.type === 'message' && event.message?.type === 'text') {
        const userId = event.source.userId
        const text = event.message.text

        console.log(`[MESSAGE] ${userId}: ${text}`)
        messageStore.push({ userId, text, timestamp: new Date() })

        let reply = ''
        if (text.includes('統計') || text.includes('分析')) {
          reply = `[STATS] 統計:\n送信数: ${messageStore.length}\nユーザー: ${new Set(messageStore.map((m) => m.userId)).size}`
        } else if (text.includes('ヘルプ')) {
          reply = '[HELP] コマンド:\n- "統計": 統計表示\n- "リセット": データ削除'
        } else if (text.includes('リセット')) {
          messageStore.length = 0
          reply = '[OK] データをリセットしました'
        } else {
          reply = `[OK] "${text}" をありがとうございます`
        }

        await sendMessage(userId, reply)
      } else if (event.type === 'postback') {
        const userId = event.source.userId
        const postbackData = event.postback.data
        const params = new URLSearchParams(postbackData)
        const action = params.get('action')

        console.log(`[POSTBACK] ${userId}: ${action}`)

        let label = postbackData
        let reply = ''

        if (action === 'yes') {
          label = 'はい'
          reply = '[OK] ご協力ありがとうございます'
        } else if (action === 'no') {
          label = 'いいえ'
          reply = '[INFO] 「いいえ」を選択されました'
        } else if (action === 'save') {
          label = '保存'
          reply = '[OK] データを保存しました'
        } else if (action === 'cancel') {
          label = 'キャンセル'
          reply = '[CANCEL] 処理をキャンセルしました'
        }

        messageStore.push({ userId, text: label, timestamp: new Date() })
        if (reply) await sendMessage(userId, reply)
      } else if (event.type === 'follow') {
        const userId = event.source.userId
        console.log(`[FOLLOW] ${userId}`)
        await sendMessage(userId, 'ようこそ！LINE API ボットです')
      }
    }
  } catch (error) {
    console.error('[ERROR]', error)
  }
})

// 統計 API
app.get('/stats', (req, res) => {
  res.json({
    totalMessages: messageStore.length,
    uniqueUsers: new Set(messageStore.map((m) => m.userId)).size,
    messages: messageStore.slice(-10),
  })
})

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('[ERROR]', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// サーバー起動
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`[START] Server running on port ${PORT}`)
  console.log(`[WEBHOOK] POST http://localhost:${PORT}/webhook`)
  console.log(`[STATS] GET http://localhost:${PORT}/stats`)
})
