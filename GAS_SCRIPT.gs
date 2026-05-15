// Google Apps Script - Google Sheet へのデータ書き込み用
// アクセス: Googleアカウントを持つ全員 でも動作する
//
// デプロイ設定:
//   次のユーザーとして実行: 自分
//   アクセスできるユーザー: Googleアカウントを持つ全員
//
// Vercel の環境変数に設定:
//   GAS_DEPLOYMENT_URL = このスクリプトの /exec URL
//   GAS_TOKEN = 任意の秘密の文字列（例: mySecretToken123）

// 簡易認証トークン（GAS_SCRIPT内に直接設定）
const ACCESS_TOKEN = 'line_webhook_2025';

function doPost(e) {
  try {
    // トークン検証（URLパラメータ）
    const token = e.parameter && e.parameter.token;
    if (token !== ACCESS_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Unauthorized'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();

    const timestamp = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
    });

    sheet.appendRow([
      timestamp,
      data.userId,
      data.messageType || 'text',
      data.text
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // トークン検証
    const token = e.parameter && e.parameter.token;
    if (token !== ACCESS_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Unauthorized'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();

    const messages = data.slice(1).map(row => ({
      timestamp: row[0],
      userId: row[1],
      type: row[2],
      text: row[3]
    }));

    const totalMessages = messages.length;
    const uniqueUsers = [...new Set(messages.map(m => m.userId))].length;
    const totalLength = messages.reduce((sum, m) => sum + (m.text ? m.text.toString().length : 0), 0);
    const averageLength = totalMessages > 0 ? Math.round(totalLength / totalMessages * 10) / 10 : 0;

    const userStatsMap = {};
    messages.forEach(msg => {
      if (!userStatsMap[msg.userId]) {
        userStatsMap[msg.userId] = {
          userId: msg.userId,
          messageCount: 0,
          messages: []
        };
      }
      userStatsMap[msg.userId].messageCount++;
      userStatsMap[msg.userId].messages.push({
        text: msg.text,
        timestamp: msg.timestamp,
        type: msg.type
      });
    });

    return ContentService.createTextOutput(JSON.stringify({
      totalMessages,
      uniqueUsers,
      totalLength,
      averageLength,
      userStats: Object.values(userStatsMap)
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
