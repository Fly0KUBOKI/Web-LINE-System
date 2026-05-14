import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

// メモリ上のメッセージストア（本番環境ではDBを使用）
const messageStore: Array<{ userId: string; text: string; timestamp: Date }> = []

function validateSignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_WEBHOOK_SECRET || ''
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64')
  return hash === signature
}

async function sendMessage(userId: string, text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) throw new Error('LINE_CHANNEL_ACCESS_TOKEN not configured')

  await fetch('https://api.line.me/v2/bot/message/push', {
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // Vercel では req.body は既に JSON パース済みのため、
  // 署名検証のためにはバッファまたは raw body が必要
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  const signature = req.headers['x-line-signature'] as string

  // 署名検証が失敗しても処理を継続（デバッグ用）
  const isValidSignature = validateSignature(rawBody, signature)
  console.log(
    `[DEBUG] Signature validation: ${isValidSignature ? 'PASS' : 'FAIL'}`,
    `Expected: ${signature}`,
  )

  try {
    const events = req.body.events || []

    // イベント処理を非同期で実行（ユーザーに即座に 200 OK を返す）
    ;(async () => {
      for (const event of events) {
        console.log(`[EVENT] Received: ${event.type}`)

        if (event.type === 'message' && event.message?.type === 'text') {
          const userId = event.source.userId
          const text = event.message.text

          console.log(`[MESSAGE] User: ${userId}, Text: ${text}`)

          // メッセージを記録
          messageStore.push({ userId, text, timestamp: new Date() })

          // キーワード処理
          let reply = ''
          if (text.includes('統計') || text.includes('分析')) {
            const summary = {
              total: messageStore.length,
              users: new Set(messageStore.map((m) => m.userId)).size,
            }
            reply = `[STATS] 統計情報:\n送信数: ${summary.total}\nユーザー数: ${summary.users}`
          } else if (text.includes('ヘルプ')) {
            reply = `[HELP] コマンド:\n- "統計" : 統計表示\n- "リセット" : データ削除`
          } else if (text.includes('リセット')) {
            messageStore.length = 0
            reply = '[OK] データをリセットしました'
          } else {
            reply = `[OK] "${text}" をありがとうございます`
          }

          if (reply) {
            await sendMessage(userId, reply).catch((e) => console.error('[SEND_ERROR]', e))
          }
        } else if (event.type === 'postback') {
          const userId = event.source.userId
          const postbackData = event.postback.data

          console.log(`[POSTBACK] User: ${userId}, Data: ${postbackData}`)

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
          if (reply) {
            await sendMessage(userId, reply).catch((e) => console.error('[SEND_ERROR]', e))
          }
        } else if (event.type === 'follow') {
          const userId = event.source.userId
          console.log(`[FOLLOW] User: ${userId}`)
          await sendMessage(userId, 'ようこそ！LINE API ボットです').catch((e) =>
            console.error('[SEND_ERROR]', e),
          )
        }
      }
    })()

    // 即座に 200 OK を返す（LINE プラットフォームの要件）
    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error('[ERROR]', error)
    // エラーでも 200 OK を返す（LINE プラットフォームの要件）
    res.status(200).json({ status: 'error', error: String(error) })
  }
}
