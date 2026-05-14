const crypto = require('crypto');
require('dotenv').config();

// Webhook テスト用のシミュレーター
async function testWebhook() {
  const webhookSecret = process.env.LINE_WEBHOOK_SECRET;
  const webhookUrl = 'http://localhost:3000/webhook';
  const userId = 'U37cbb8df484561fb3666066d719d4672';

  // テストイベントのリスト
  const events = [
    {
      name: 'テキストメッセージ: はい',
      event: {
        type: 'message',
        message: {
          type: 'text',
          text: 'はい'
        },
        source: { userId },
        timestamp: Date.now()
      }
    },
    {
      name: 'ボタン応答: はい (postback)',
      event: {
        type: 'postback',
        postback: {
          data: 'action=yes&user_id=U37cbb8df484561fb3666066d719d4672'
        },
        source: { userId },
        timestamp: Date.now()
      }
    },
    {
      name: 'テキストメッセージ: 保存',
      event: {
        type: 'message',
        message: {
          type: 'text',
          text: '保存'
        },
        source: { userId },
        timestamp: Date.now()
      }
    },
    {
      name: 'ボタン応答: 保存 (postback)',
      event: {
        type: 'postback',
        postback: {
          data: 'action=save&user_id=U37cbb8df484561fb3666066d719d4672'
        },
        source: { userId },
        timestamp: Date.now()
      }
    },
    {
      name: 'テキストメッセージ: 私は',
      event: {
        type: 'message',
        message: {
          type: 'text',
          text: '私は'
        },
        source: { userId },
        timestamp: Date.now()
      }
    },
    {
      name: 'ボタン応答: いいえ (postback)',
      event: {
        type: 'postback',
        postback: {
          data: 'action=no&user_id=U37cbb8df484561fb3666066d719d4672'
        },
        source: { userId },
        timestamp: Date.now()
      }
    }
  ];

  console.log('==================================================');
  console.log('LINE Webhook テストシミュレーター');
  console.log('==================================================\n');

  for (const { name, event } of events) {
    try {
      const body = JSON.stringify({ events: [event] });

      // Webhook 署名を生成
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('base64');

      console.log(`\n[${name}]`);
      console.log('-'.repeat(50));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-Signature': signature
        },
        body
      });

      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${JSON.stringify(data)}`);

      // 応答があるまで少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`エラー: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Webhook テスト完了');
  console.log('='.repeat(50));
}

testWebhook();
