const crypto = require('crypto')
const http = require('http')
require('dotenv').config()

async function testWebhook() {
  const webhookSecret = process.env.LINE_WEBHOOK_SECRET
  const userId = process.env.USER_ID
  // Try the webhook URL from env, service name for docker-compose, then container IP
  const webhookUrl = process.env.WEBHOOK_URL || 'http://172.18.0.2:3000/webhook'

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
  console.log('ローカル Webhook テスト')
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

      console.log(`Webhook URL: ${webhookUrl}`)
      console.log(`Signature: ${signature.substring(0, 10)}...`)

      // Parse URL
      const url = new URL(webhookUrl)
      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-Signature': signature,
          'Content-Length': Buffer.byteLength(body),
        },
      }

      // Make HTTP request
      await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let responseData = ''

          res.on('data', (chunk) => {
            responseData += chunk
          })

          res.on('end', () => {
            console.log(`Status: ${res.statusCode}`)
            console.log(`Response text: ${responseData}`)

            try {
              const data = JSON.parse(responseData)
              console.log(`Response JSON: ${JSON.stringify(data)}`)
            } catch (e) {
              console.log(`(Response was not JSON)`)
            }

            if (res.statusCode === 200) {
              console.log('✅ 成功')
            } else {
              console.log('❌ 失敗')
            }

            resolve()
          })
        })

        req.on('error', (error) => {
          console.error(`リクエストエラー: ${error.message}`)
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

testWebhook()
