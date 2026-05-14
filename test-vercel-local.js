const crypto = require('crypto')
require('dotenv').config()

const http = require('http')

async function testWebhookLocal() {
  const webhookSecret = process.env.LINE_WEBHOOK_SECRET
  const userId = process.env.USER_ID
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
  console.log('Vercel Serverless Function ローカルテスト')
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

      // HTTP リクエスト
      await new Promise((resolve, reject) => {
        const urlObj = new URL(webhookUrl)
        // ホスト名を抽出（IPv4 アドレスの場合はそのまま）
        let hostname = urlObj.hostname
        console.log(`Debug: webhookUrl=${webhookUrl}, hostname=${hostname}`)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          hostname = '172.18.0.2'
        }
        console.log(`Debug: final hostname=${hostname}`)

        const options = {
          hostname: hostname,
          port: parseInt(urlObj.port) || 3000,
          path: urlObj.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Line-Signature': signature,
            'Content-Length': Buffer.byteLength(body),
          },
        }

        const req = http.request(options, (res) => {
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

testWebhookLocal()
