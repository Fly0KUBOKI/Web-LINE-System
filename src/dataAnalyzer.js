class DataAnalyzer {
  constructor() {
    this.messageHistory = [];
    this.userStats = {};
  }

  // メッセージを記録
  recordMessage(userId, text, timestamp = new Date()) {
    this.messageHistory.push({
      userId,
      text,
      timestamp,
      length: text.length
    });

    if (!this.userStats[userId]) {
      this.userStats[userId] = {
        messageCount: 0,
        totalLength: 0,
        firstMessage: timestamp,
        lastMessage: timestamp
      };
    }

    this.userStats[userId].messageCount++;
    this.userStats[userId].totalLength += text.length;
    this.userStats[userId].lastMessage = timestamp;
  }

  // ユーザー別の統計を取得
  getUserStats(userId) {
    return this.userStats[userId] || null;
  }

  // 全ユーザーの統計を取得
  getAllStats() {
    return Object.entries(this.userStats).map(([userId, stats]) => ({
      userId,
      ...stats,
      averageMessageLength: (stats.totalLength / stats.messageCount).toFixed(2)
    }));
  }

  // メッセージ履歴を検索
  searchMessages(keyword) {
    return this.messageHistory.filter(msg =>
      msg.text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 時間帯別のメッセージ集計
  getMessageCountByHour() {
    const hourCounts = {};

    this.messageHistory.forEach(msg => {
      const hour = msg.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return hourCounts;
  }

  // メッセージ統計サマリー
  getSummary() {
    const totalMessages = this.messageHistory.length;
    const uniqueUsers = Object.keys(this.userStats).length;
    const totalLength = this.messageHistory.reduce((sum, msg) => sum + msg.length, 0);

    return {
      totalMessages,
      uniqueUsers,
      totalLength,
      averageLength: (totalLength / totalMessages).toFixed(2),
      userStats: this.getAllStats()
    };
  }

  // データをJSONでエクスポート
  exportToJSON() {
    return {
      summary: this.getSummary(),
      history: this.messageHistory,
      userStats: this.userStats
    };
  }

  // データを初期化
  reset() {
    this.messageHistory = [];
    this.userStats = {};
  }
}

module.exports = DataAnalyzer;
