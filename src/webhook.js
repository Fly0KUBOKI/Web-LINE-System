require('dotenv').config();
const express = require('express');
const LineClient = require('./lineClient');
const DataAnalyzer = require('./dataAnalyzer');
const crypto = require('crypto');

const app = express();
const client = new LineClient(process.env.LINE_CHANNEL_ACCESS_TOKEN);
const analyzer = new DataAnalyzer();

app.use(express.json());

// Webhook署名の検証
function validateSignature(body, signature) {
  const hash = crypto
    .createHmac('sha256', process.env.LINE_WEBHOOK_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// Webhookエンドポイント
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-line-signature'];
  const body = req.body;

  // 署名検証
  if (!validateSignature(body, signature)) {
    console.warn('❌ 無効な署名です');
    return res.status(401).send('Unauthorized');
  }

  try {
    const events = JSON.parse(body).events;

    for (const event of events) {
      console.log('\n📩 イベント受信:', event.type);

      if (event.type === 'message' && event.message.type === 'text') {
        const userId = event.source.userId;
        const userMessage = event.message.text;

        console.log(`ユーザー: ${userId}`);
        console.log(`メッセージ: ${userMessage}`);

        // メッセージを分析データに記録
        analyzer.recordMessage(userId, userMessage);

        // キーワードに応じた処理
        if (userMessage.includes('統計') || userMessage.includes('分析')) {
          const summary = analyzer.getSummary();
          await client.sendTextMessage(
            userId,
            `[STATS] 統計情報:\n総メッセージ数: ${summary.totalMessages}\nユーザー数: ${summary.uniqueUsers}\n総文字数: ${summary.totalLength}`
          );
        } else if (userMessage.includes('ヘルプ') || userMessage.includes('help')) {
          const helpMessage = `[HELP] 利用可能なコマンド:
- "統計" または "分析" : メッセージ統計を表示
- "リセット" : データをリセット
- その他のテキスト : エコーバック`;
          await client.sendTextMessage(userId, helpMessage);
        } else if (userMessage.includes('リセット')) {
          analyzer.reset();
          await client.sendTextMessage(userId, '[OK] データをリセットしました');
        } else {
          // 通常のテキスト応答
          const replyMessage = `[OK] "${userMessage}"というメッセージをありがとうございます！`;
          await client.sendTextMessage(userId, replyMessage);
        }

      } else if (event.type === 'postback') {
        const userId = event.source.userId;
        const postbackData = event.postback.data;

        console.log(`ユーザー: ${userId}`);
        console.log(`ボタン応答データ: ${postbackData}`);

        // postback data を解析（format: action=value&key=value）
        const params = new URLSearchParams(postbackData);
        const action = params.get('action');

        // ボタン応答ラベルをメッセージとして記録
        let displayLabel = postbackData;
        if (action === 'yes') {
          displayLabel = 'はい';
          analyzer.recordMessage(userId, displayLabel);
          await client.sendTextMessage(userId, '[OK] ご協力ありがとうございます！「はい」を選択されました。');
        } else if (action === 'no') {
          displayLabel = 'いいえ';
          analyzer.recordMessage(userId, displayLabel);
          await client.sendTextMessage(userId, '[INFO] 「いいえ」を選択されました。何かお困りですか？');
        } else if (action === 'save') {
          displayLabel = '保存';
          analyzer.recordMessage(userId, displayLabel);
          await client.sendTextMessage(userId, '[OK] データを保存しました');
        } else if (action === 'cancel') {
          displayLabel = 'キャンセル';
          analyzer.recordMessage(userId, displayLabel);
          await client.sendTextMessage(userId, '[CANCEL] 処理をキャンセルしました');
        } else {
          analyzer.recordMessage(userId, displayLabel);
          await client.sendTextMessage(userId, `[OK] ボタン応答を受け取りました`);
        }

      } else if (event.type === 'follow') {
        const userId = event.source.userId;
        console.log(`ユーザーがフォローしました: ${userId}`);
        await client.sendTextMessage(
          userId,
          'ようこそ！このボットはLINE Messaging APIのテストプログラムです。'
        );

      } else if (event.type === 'unfollow') {
        console.log('ユーザーがフォロー解除しました');

      } else if (event.type === 'join') {
        console.log('グループに参加しました');
      }
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 健康チェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 統計情報エンドポイント
app.get('/stats', (req, res) => {
  res.json(analyzer.getSummary());
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`=`.repeat(50));
  console.log(`🚀 LINE Webhook サーバーが起動しました`);
  console.log(`   ポート: ${PORT}`);
  console.log(`   Webhookエンドポイント: http://localhost:${PORT}/webhook`);
  console.log(`   統計情報: http://localhost:${PORT}/stats`);
  console.log(`=`.repeat(50));
});
