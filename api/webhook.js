const crypto = require('crypto');
const LineClient = require('../src/lineClient');
const DataAnalyzer = require('../src/dataAnalyzer');

const client = new LineClient(process.env.LINE_CHANNEL_ACCESS_TOKEN);
const analyzer = new DataAnalyzer();

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
    await client.sendTextMessage(userId, text);
  } catch (error) {
    console.error('メッセージ送信エラー:', error.message);
  }
}

// Vercel API route handler
export default async function handler(req, res) {
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

    // req.body は Vercel で既に JSON パースされているため、文字列に変換
    if (typeof body === 'object') {
      body = JSON.stringify(body);
    } else if (!body) {
      body = '';
    }

    // 署名検証
    if (!validateSignature(body, signature)) {
      console.warn('❌ 無効な署名です');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const events = JSON.parse(body).events || [];

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

            analyzer.recordMessage(userId, userMessage);

            let reply = '';
            if (userMessage.includes('統計') || userMessage.includes('分析')) {
              const summary = analyzer.getSummary();
              reply = `[STATS] 統計情報:\n総メッセージ数: ${summary.totalMessages}\nユーザー数: ${summary.uniqueUsers}\n総文字数: ${summary.totalLength}`;
            } else if (userMessage.includes('ヘルプ')) {
              reply = `[HELP] 利用可能なコマンド:\n- "統計" : メッセージ統計を表示\n- "リセット" : データをリセット`;
            } else if (userMessage.includes('リセット')) {
              analyzer.reset();
              reply = '[OK] データをリセットしました';
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
            if (action === 'yes') {
              analyzer.recordMessage(userId, 'はい');
              reply = '[OK] ご協力ありがとうございます！「はい」を選択されました。';
            } else if (action === 'no') {
              analyzer.recordMessage(userId, 'いいえ');
              reply = '[INFO] 「いいえ」を選択されました。';
            } else if (action === 'save') {
              analyzer.recordMessage(userId, '保存');
              reply = '[OK] データを保存しました';
            } else if (action === 'cancel') {
              analyzer.recordMessage(userId, 'キャンセル');
              reply = '[CANCEL] 処理をキャンセルしました';
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
      console.error('❌ エラーが発生しました:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    return;
  }

  // その他のリクエスト
  res.status(404).json({ error: 'Not Found' });
}
