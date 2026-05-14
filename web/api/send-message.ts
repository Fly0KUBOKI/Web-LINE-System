import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' })
  }

  const { userId, messages } = req.body as {
    userId: string
    messages: Array<{ type: string; text: string }>
  }

  if (!userId || !messages?.length) {
    return res.status(400).json({ error: 'userId and messages are required' })
  }

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: userId, messages }),
  })

  const data = await response.json()
  if (!response.ok) {
    return res.status(response.status).json(data)
  }

  return res.status(200).json(data)
}
