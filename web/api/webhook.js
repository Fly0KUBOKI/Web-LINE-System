import crypto from 'crypto'

const messageStore = []

function validateSignature(body, signature) {
  const secret = process.env.LINE_WEBHOOK_SECRET || ''
  const hash = crypto.createHmac('sha256', secret).update(body).digest('base64')
  return hash === signature
}

async function sendMessage(userId, text) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) throw new Error('LINE_CHANNEL_ACCESS_TOKEN not configured')

  const res = await fetch('https://api.line.me/v2/bot/message/push', {
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

  if (!res.ok) {
    console.error(`[SEND_ERROR] Status: ${res.status}`, await res.text())
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  const signature = req.headers['x-line-signature']

  console.log('[DEBUG] Webhook received', { method: req.method, signature: !!signature })

  // 即座に 200 OK を返す（LINE プラットフォームの要件）
  res.status(200).json({ status: 'ok' })

  // イベント処理を非同期で実行
  try {
    const events = req.body.events || []

    for (const event of events) {
      console.log(`[EVENT] ${event.type}`)

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
        await sendMessage(userId, 'ようこそ！LINE API ボットです')
      }
    }
  } catch (error) {
    console.error('[ERROR]', error)
  }
}
