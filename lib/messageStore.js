// グローバルなメッセージストア
// NOTE: 本番環境では必ずデータベース（MongoDB, PostgreSQL, Firebase など）を使用してください
// Vercel Serverless では各リクエストで新しいプロセスが起動されるため、メモリの保持はできません

let globalStore = {
  messages: [],
};

module.exports = {
  addMessage: (userId, text) => {
    globalStore.messages.push({
      userId,
      text,
      timestamp: new Date().toISOString(),
    });
  },

  getStats: () => {
    const totalMessages = globalStore.messages.length;
    const uniqueUsers = new Set(globalStore.messages.map(m => m.userId)).size;
    const totalLength = globalStore.messages.reduce((sum, m) => sum + m.text.length, 0);
    const averageLength = totalMessages > 0 ? Math.round(totalLength / totalMessages * 10) / 10 : 0;

    const userStats = [];
    globalStore.messages.forEach(msg => {
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
        timestamp: msg.timestamp
      });
    });

    return {
      totalMessages,
      uniqueUsers,
      totalLength,
      averageLength,
      userStats
    };
  },

  reset: () => {
    globalStore.messages = [];
  },

  getMessages: () => globalStore.messages,
};
