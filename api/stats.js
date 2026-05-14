module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  res.json({
    totalMessages: 0,
    uniqueUsers: 0,
    totalLength: 0,
    averageLength: 0,
    userStats: [],
  })
}
