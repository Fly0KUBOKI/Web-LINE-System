// Google Apps Script - LINE Webhook データ保存用
// GETパラメータでアクション切り替え（POSTリダイレクト問題を回避）
//
// デプロイ設定:
//   次のユーザーとして実行: 自分
//   アクセスできるユーザー: Googleアカウントを持つ全員
//
// Vercel 環境変数:
//   GAS_DEPLOYMENT_URL = この /exec URL
//   GAS_TOKEN = line_webhook_2025

const ACCESS_TOKEN = 'line_webhook_2025';

// GET で全操作（POST リダイレクト問題を回避）
// ?action=add&token=xxx&userId=xxx&text=xxx&messageType=xxx → 追記
// ?action=stats&token=xxx → 統計取得
function doGet(e) {
  const token = e.parameter && e.parameter.token;
  if (token !== ACCESS_TOKEN) {
    return json({ status: 'error', message: 'Unauthorized' });
  }

  const action = e.parameter.action || 'stats';

  if (action === 'add') {
    return addMessage(e.parameter);
  } else {
    return getStats();
  }
}

function doPost(e) {
  // POSTも受け付けるが、GASのリダイレクト問題でContent-Lengthエラーになる場合は
  // GETのaction=addを使うこと
  try {
    const token = e.parameter && e.parameter.token;
    if (token !== ACCESS_TOKEN) {
      return json({ status: 'error', message: 'Unauthorized' });
    }

    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();
    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    sheet.appendRow([timestamp, data.userId, data.messageType || 'text', data.text]);

    return json({ status: 'success' });
  } catch (error) {
    return json({ status: 'error', message: error.toString() });
  }
}

function addMessage(params) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    sheet.appendRow([
      timestamp,
      params.userId || '',
      params.messageType || 'text',
      params.text || ''
    ]);
    return json({ status: 'success' });
  } catch (error) {
    return json({ status: 'error', message: error.toString() });
  }
}

function getStats() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const messages = data.slice(1).map(row => ({
      timestamp: row[0],
      userId: row[1],
      type: row[2],
      text: row[3]
    }));

    const totalMessages = messages.length;
    const uniqueUsers = [...new Set(messages.map(m => m.userId).filter(Boolean))].length;
    const totalLength = messages.reduce((sum, m) => sum + (m.text ? m.text.toString().length : 0), 0);
    const averageLength = totalMessages > 0 ? Math.round(totalLength / totalMessages * 10) / 10 : 0;

    const userStatsMap = {};
    messages.forEach(msg => {
      if (!msg.userId) return;
      if (!userStatsMap[msg.userId]) {
        userStatsMap[msg.userId] = { userId: msg.userId, messageCount: 0, messages: [] };
      }
      userStatsMap[msg.userId].messageCount++;
      userStatsMap[msg.userId].messages.push({ text: msg.text, timestamp: msg.timestamp, type: msg.type });
    });

    return json({ totalMessages, uniqueUsers, totalLength, averageLength, userStats: Object.values(userStatsMap) });
  } catch (error) {
    return json({ status: 'error', message: error.toString() });
  }
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
