const crypto = require('crypto');

// Google Apps Script のウェブアプリケーション URL
const GAS_URL = process.env.GAS_DEPLOYMENT_URL;
const GAS_TOKEN = process.env.GAS_TOKEN || 'line_webhook_2025';

// Webhook署名の検証
function validateSignature(body, signature) {
  let bodyStr;
  if (typeof body === 'string') {
    bodyStr = body;
  } else if (Buffer.isBuffer(body)) {
    bodyStr = body.toString('utf-8');
  } else {
    bodyStr = JSON.stringify(body);
  }
  const hash = crypto
    .createHmac('sha256', process.env.LINE_WEBHOOK_SECRET)
    .update(bodyStr)
    .digest('base64');
  return hash === signature;
}

// LINE メッセージ送信
async function sendMessage(userId, text) {
  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      console.error('[ERROR] LINE_CHANNEL_ACCESS_TOKEN not set');
      return;
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'text', text }],
      }),
    });

    if (!response.ok) {
      console.error(`[ERROR] Failed to send: ${response.status}`);
    }
  } catch (error) {
    console.error('メッセージ送信エラー:', error.message);
  }
}


// Vercel API route handler
module.exports = async (req, res) => {
  // CORS ヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Line-Signature');

  // OPTIONS リクエスト対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET リクエスト対応（ヘルスチェック）
  if (req.method === 'GET') {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  // POST リクエスト - Webhook処理
  if (req.method === 'POST') {
    const signature = req.headers['x-line-signature'];
    let body = req.body;

    console.log(`[WEBHOOK] Received POST request`);
    console.log(`[WEBHOOK] signature: ${signature}`);
    console.log(`[WEBHOOK] body type: ${typeof body}`);
    console.log(`[WEBHOOK] LINE_WEBHOOK_SECRET exists: ${!!process.env.LINE_WEBHOOK_SECRET}`);

    // req.body を適切に処理
    if (!body) {
      console.error('[WEBHOOK] No body received');
      res.status(400).json({ error: 'No body' });
      return;
    }

    // req.body は Vercel で既に JSON パースされているため、文字列に変換
    if (typeof body === 'object') {
      body = JSON.stringify(body);
    } else if (typeof body !== 'string') {
      body = String(body);
    }

    console.log(`[WEBHOOK] body string length: ${body.length}`);

    // 署名検証
    if (!validateSignature(body, signature)) {
      console.warn('❌ 無効な署名です');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const events = JSON.parse(body).events || [];
      console.log(`[WEBHOOK] Parsed ${events.length} events`);

      // 即座に 200 OK を返す
      res.status(200).json({ status: 'ok' });

      // イベント処理は非同期で実行
      (async () => {
        for (const event of events) {
          console.log('\n📩 イベント受信:', event.type);

          if (event.type === 'message' && event.message?.type === 'text') {
            const userId = event.source.userId;
            const userMessage = event.message.text;

            console.log(`ユーザー: ${userId}`);
            console.log(`メッセージ: ${userMessage}`);

            // GAS にメッセージを送信（Base64エンコードで文字化け防止）
            if (GAS_URL) {
              try {
                const params = new URLSearchParams({
                  action: 'add',
                  token: GAS_TOKEN,
                  userId: Buffer.from(userId, 'utf-8').toString('base64'),
                  userIdEncoded: '1',
                  text: Buffer.from(userMessage, 'utf-8').toString('base64'),
                  encoded: '1',
                  messageType: 'text'
                });
                await fetch(`${GAS_URL}?${params}`);
              } catch (error) {
                console.error('GAS 送信エラー:', error.message);
              }
            }

            let reply = '';
            if (userMessage.includes('統計') || userMessage.includes('分析')) {
              reply = `[STATS] 統計情報はダッシュボードで確認できます。`;
            } else if (userMessage.includes('ヘルプ')) {
              reply = `[HELP] 利用可能なコマンド:\n- "統計" : メッセージ統計を表示\n- "ダッシュボード" : web上で統計を確認`;
            } else {
              reply = `[OK] "${userMessage}"というメッセージをありがとうございます！`;
            }

            if (reply) await sendMessage(userId, reply);

          } else if (event.type === 'postback') {
            const userId = event.source.userId;
            const postbackData = event.postback.data;

            console.log(`ユーザー: ${userId}`);
            console.log(`ボタン応答データ: ${postbackData}`);

            const params = new URLSearchParams(postbackData);
            const action = params.get('action');

            let reply = '';
            let actionText = '';
            if (action === 'yes') {
              actionText = 'はい';
              reply = '[OK] ご協力ありがとうございます！「はい」を選択されました。';
            } else if (action === 'no') {
              actionText = 'いいえ';
              reply = '[INFO] 「いいえ」を選択されました。';
            } else if (action === 'save') {
              actionText = '保存';
              reply = '[OK] データを保存しました';
            } else if (action === 'cancel') {
              actionText = 'キャンセル';
              reply = '[CANCEL] 処理をキャンセルしました';
            }

            if (actionText && GAS_URL) {
              try {
                const params = new URLSearchParams({
                  action: 'add',
                  token: GAS_TOKEN,
                  userId: Buffer.from(userId, 'utf-8').toString('base64'),
                  userIdEncoded: '1',
                  text: Buffer.from(actionText, 'utf-8').toString('base64'),
                  encoded: '1',
                  messageType: 'postback'
                });
                await fetch(`${GAS_URL}?${params}`);
              } catch (error) {
                console.error('GAS 送信エラー:', error.message);
              }
            }

            if (reply) await sendMessage(userId, reply);

          } else if (event.type === 'follow') {
            const userId = event.source.userId;
            console.log(`ユーザーがフォローしました: ${userId}`);
            await sendMessage(userId, 'ようこそ！このボットはLINE Messaging APIのテストプログラムです。');
          }
        }
      })().catch((error) => {
        console.error('イベント処理エラー:', error);
      });

    } catch (error) {
      console.error('❌ エラーが発生しました:', error.message);
      console.error('Stack:', error.stack);
      // 既に 200 を返している場合は res.status を変更できないため、ここでは何もしない
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
      }
    }
    return;
  }

  // その他のリクエスト
  res.status(404).json({ error: 'Not Found' });
};
