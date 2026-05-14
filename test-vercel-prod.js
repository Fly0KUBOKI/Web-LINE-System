const crypto = require('crypto')
require('dotenv').config()

const http = require('http')
const https = require('https')

async function testWebhookProd() {
  const webhookSecret = process.env.LINE_WEBHOOK_SECRET
  const userId = process.env.USER_ID
  const webhookUrl = 'https://web-line-system.vercel.app/api/webhook'

  if (!webhookSecret || !userId) {
    console.error('[ERROR] LINE_WEBHOOK_SECRET or USER_ID not set in .env')
    process.exit(1)
  }

  const testEvents = [
    {
      name: 'テキストメッセージ: こんにちは',
      event: {
        type: 'message',
        message: {
          type: 'text',
          text: 'こんにちは',
        },
        source: { userId },
        timestamp: Date.now(),
      },
    },
    {
      name: 'テキストメッセージ: 統計',
      event: {
        type: 'message',
        message: {
          type: 'text',
          text: '統計',
        },
        source: { userId },
        timestamp: Date.now(),
      },
    },
    {
      name: 'ボタン応答: はい',
      event: {
        type: 'postback',
        postback: {
          data: 'action=yes&user_id=' + userId,
        },
        source: { userId },
        timestamp: Date.now(),
      },
    },
  ]

  console.log('==================================================')
  console.log('Vercel 本番環境 Webhook テスト')
  console.log('==================================================\n')

  for (const { name, event } of testEvents) {
    try {
      const body = JSON.stringify({ events: [event] })

      // Webhook 署名を生成
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('base64')

      console.log(`\n[${name}]`)
      console.log('-'.repeat(50))

      console.log(`URL: ${webhookUrl}`)
      console.log(`Signature: ${signature.substring(0, 10)}...`)

      // HTTPS リクエスト
      await new Promise((resolve, reject) => {
        const urlObj = new URL(webhookUrl)
        const options = {
          hostname: urlObj.hostname,
          port: urlObj.port || 443,
          path: urlObj.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Line-Signature': signature,
            'Content-Length': Buffer.byteLength(body),
          },
        }

        const req = https.request(options, (res) => {
          let responseData = ''

          res.on('data', (chunk) => {
            responseData += chunk
          })

          res.on('end', () => {
            console.log(`Status: ${res.statusCode}`)
            console.log(`Response: ${responseData}`)

            if (res.statusCode === 200) {
              console.log('✅ 成功')
            } else {
              console.log('❌ 失敗')
            }

            resolve()
          })
        })

        req.on('error', (error) => {
          console.error(`エラー: ${error.message}`)
          reject(error)
        })

        req.write(body)
        req.end()
      })

      // 応答を待機
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`エラー: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('テスト完了')
  console.log('='.repeat(50))
}

testWebhookProd()
