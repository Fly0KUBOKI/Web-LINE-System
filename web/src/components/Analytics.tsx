import { Trash2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { computeSummary, hourlyChartData } from '@/lib/analytics'
import { useMessageStore } from '@/components/MessageStoreContext'

export default function Analytics() {
  const { records, clear } = useMessageStore()
  const summary = computeSummary(records)
  const chartData = hourlyChartData(summary.byHour)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">データ分析</h1>
        {records.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            データをリセット
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">
            まだデータがありません。メッセージを送信すると分析が表示されます。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: '送信成功', value: summary.totalMessages },
              { label: 'ユニークユーザー', value: summary.uniqueUsers },
              { label: '総文字数', value: summary.totalChars },
              { label: '平均文字数', value: summary.averageLength },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Hourly bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">時間帯別 送信数</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11 }}
                  interval={2}
                  tickFormatter={(v: string) => v.slice(0, 2)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [`${value} 件`, '送信数']}
                  labelFormatter={(label: string) => `${label}台`}
                />
                <Bar dataKey="count" fill="#06C755" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Log table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">送信ログ</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">日時</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">メッセージ</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">文字数</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">状態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-3 text-gray-800 max-w-xs truncate">{r.text}</td>
                      <td className="px-6 py-3 text-gray-500">{r.text.length}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.status === 'sent'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {r.status === 'sent' ? '成功' : 'エラー'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
