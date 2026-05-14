export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' })
  }

  const { userId } = req.query
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
