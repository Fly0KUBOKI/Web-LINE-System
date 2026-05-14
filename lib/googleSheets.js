const { google } = require('googleapis');

// Google Sheets API クライアント
let sheetsClient = null;

async function initializeSheets() {
  if (sheetsClient) return sheetsClient;

  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('[SHEETS] Initialized successfully');
    return sheetsClient;
  } catch (error) {
    console.error('[SHEETS] Initialization error:', error.message);
    return null;
  }
}

async function addMessage(userId, text, messageType = 'text') {
  try {
    const sheets = await initializeSheets();
    if (!sheets) {
      console.warn('[SHEETS] Sheets not initialized, message not recorded');
      return false;
    }

    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (!sheetId) {
      console.warn('[SHEETS] GOOGLE_SHEETS_ID not set');
      return false;
    }

    const timestamp = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
    });

    const values = [[timestamp, userId, messageType, text]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values,
      },
    });

    console.log(`[SHEETS] Message recorded: ${userId} - ${text}`);
    return true;
  } catch (error) {
    console.error('[SHEETS] Error adding message:', error.message);
    return false;
  }
}

async function getStats() {
  try {
    const sheets = await initializeSheets();
    if (!sheets) return null;

    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (!sheetId) return null;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:D',
    });

    const rows = response.data.values || [];

    // ヘッダーをスキップ
    const messages = rows.slice(1).map(row => ({
      timestamp: row[0],
      userId: row[1],
      type: row[2],
      text: row[3],
    }));

    const totalMessages = messages.length;
    const uniqueUsers = new Set(messages.map(m => m.userId)).size;
    const totalLength = messages.reduce((sum, m) => sum + (m.text ? m.text.length : 0), 0);

    return {
      totalMessages,
      uniqueUsers,
      totalLength,
      messages,
    };
  } catch (error) {
    console.error('[SHEETS] Error getting stats:', error.message);
    return null;
  }
}

module.exports = {
  addMessage,
  getStats,
  initializeSheets,
};
