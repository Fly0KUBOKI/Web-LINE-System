// Google Apps Script - Google Sheet へのデータ書き込み用
// 1. Google Sheet を開く
// 2. 拡張機能 → Apps Script
// 3. このコードをコピーして貼り付け
// 4. デプロイ → 新しいデプロイ → ウェブアプリ
// 5. 実行アカウント: 自分、アクセス: 全員

function doPost(e) {
  try {
    // リクエストボディを取得
    const data = JSON.parse(e.postData.contents);

    // スプレッドシートを取得
    const sheet = SpreadsheetApp.getActiveSheet();

    // タイムスタンプ、ユーザーID、メッセージタイプ、テキストを追加
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
    // スプレッドシートとデータ取得
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // ヘッダーをスキップ
    const messages = data.slice(1).map(row => ({
      timestamp: row[0],
      userId: row[1],
      type: row[2],
      text: row[3]
    }));

    // 統計を計算
    const totalMessages = messages.length;
    const uniqueUsers = [...new Set(messages.map(m => m.userId))].length;
    const totalLength = messages.reduce((sum, m) => sum + (m.text ? m.text.toString().length : 0), 0);
    const averageLength = totalMessages > 0 ? Math.round(totalLength / totalMessages * 10) / 10 : 0;

    // ユーザーごとの統計
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

    const userStats = Object.values(userStatsMap);

    return ContentService.createTextOutput(JSON.stringify({
      totalMessages,
      uniqueUsers,
      totalLength,
      averageLength,
      userStats
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
