import type { VercelRequest, VercelResponse } from '@vercel/node'

// 注: 本番環境ではデータベースを使用してください
// ここはデモ用のメモリ内ストア

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // ダミーデータを返す（実装時はDB から取得）
  res.json({
    totalMessages: 0,
    uniqueUsers: 0,
    totalLength: 0,
    averageLength: 0,
    userStats: [],
  })
}
