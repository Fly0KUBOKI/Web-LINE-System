import type { MessageRecord, AnalyticsSummary } from '@/types/line'

export function computeSummary(records: MessageRecord[]): AnalyticsSummary {
  const sent = records.filter((r) => r.status === 'sent')
  const uniqueUsers = new Set(sent.map((r) => r.userId)).size
  const totalChars = sent.reduce((sum, r) => sum + r.text.length, 0)
  const byHour: Record<number, number> = {}
  sent.forEach((r) => {
    const h = new Date(r.timestamp).getHours()
    byHour[h] = (byHour[h] ?? 0) + 1
  })
  return {
    totalMessages: sent.length,
    uniqueUsers,
    totalChars,
    averageLength: sent.length ? Math.round(totalChars / sent.length) : 0,
    byHour,
  }
}

export function hourlyChartData(byHour: Record<number, number>) {
  return Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    count: byHour[h] ?? 0,
  }))
}
