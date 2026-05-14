const crypto = require('crypto')

const messageStore = []

function validateSignature(body, signature) {
  const secret = process.env.LINE_WEBHOOK_SECRET || ''
  const hash = crypto.createHmac('sha256', secret).update(body).digest('base64')
  return hash === signature
}

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
      console.error(`[ERROR] Failed to send: ${response.status}`)
    }
  } catch (error) {
    console.error('[ERROR]', error.message)
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  console.log('[WEBHOOK] Received')

  // 即座に 200 OK を返す
  res.status(200).json({ status: 'ok' })

  // イベント処理を非同期で実行
  try {
    const events = req.body.events || []

    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        const userId = event.source.userId
        const text = event.message.text

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

        let reply = ''
        if (action === 'yes') {
          reply = '[OK] ご協力ありがとうございます'
        } else if (action === 'no') {
          reply = '[INFO] 「いいえ」を選択されました'
        } else if (action === 'save') {
          reply = '[OK] データを保存しました'
        } else if (action === 'cancel') {
          reply = '[CANCEL] 処理をキャンセルしました'
        }

        messageStore.push({ userId, text: action || postbackData, timestamp: new Date() })
        if (reply) await sendMessage(userId, reply)
      } else if (event.type === 'follow') {
        const userId = event.source.userId
        await sendMessage(userId, 'ようこそ！LINE API ボットです')
      }
    }
  } catch (error) {
    console.error('[ERROR]', error)
  }
}
