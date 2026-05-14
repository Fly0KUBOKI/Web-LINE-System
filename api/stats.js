// グローバルなメッセージストア（本番環境ではデータベースを使用すること）
let globalMessageStore = {
  messages: [],
  userStats: {}
};

module.exports = (req, res) => {
  // CORS ヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // 統計情報を計算
    const totalMessages = globalMessageStore.messages.length;
    const uniqueUsers = new Set(globalMessageStore.messages.map(m => m.userId)).size;
    const totalLength = globalMessageStore.messages.reduce((sum, m) => sum + m.text.length, 0);
    const averageLength = totalMessages > 0 ? Math.round(totalLength / totalMessages * 10) / 10 : 0;

    // ユーザーごとの統計
    const userStats = [];
    globalMessageStore.messages.forEach(msg => {
      let userStat = userStats.find(u => u.userId === msg.userId);
      if (!userStat) {
        userStat = {
          userId: msg.userId,
          messageCount: 0,
          messages: []
        };
        userStats.push(userStat);
      }
      userStat.messageCount++;
      userStat.messages.push({
        text: msg.text,
        timestamp: msg.timestamp,
        type: 'received'
      });
    });

    res.status(200).json({
      totalMessages,
      uniqueUsers,
      totalLength,
      averageLength,
      userStats
    });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};

// メッセージストアをエクスポート（webhook.js で使用）
module.exports.getStore = () => globalMessageStore;
module.exports.addMessage = (userId, text) => {
  globalMessageStore.messages.push({
    userId,
    text,
    timestamp: new Date().toISOString()
  });
};
module.exports.reset = () => {
  globalMessageStore = { messages: [], userStats: {} };
};
