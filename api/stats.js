const GAS_URL = process.env.GAS_DEPLOYMENT_URL;
const GAS_TOKEN = process.env.GAS_TOKEN || 'line_webhook_2025';

module.exports = async (req, res) => {
  // CORS ヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    if (!GAS_URL) {
      res.status(200).json({
        totalMessages: 0,
        uniqueUsers: 0,
        totalLength: 0,
        averageLength: 0,
        userStats: []
      });
      return;
    }

    try {
      const response = await fetch(`${GAS_URL}?token=${GAS_TOKEN}`);
      const stats = await response.json();
      res.status(200).json(stats);
    } catch (error) {
      console.error('[STATS] Error fetching from GAS:', error.message);
      res.status(200).json({
        totalMessages: 0,
        uniqueUsers: 0,
        totalLength: 0,
        averageLength: 0,
        userStats: []
      });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
