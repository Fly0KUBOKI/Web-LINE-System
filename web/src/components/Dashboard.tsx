import { useEffect, useState } from 'react'
import { Users, MessageCircle, Hash, Clock } from 'lucide-react'
import { lineApi } from '@/lib/lineApi'
import { computeSummary } from '@/lib/analytics'
import { useMessageStore } from '@/components/MessageStoreContext'
import type { UserProfile } from '@/types/line'

export default function Dashboard() {
  const { records } = useMessageStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const userId = import.meta.env.VITE_LINE_USER_ID as string

  useEffect(() => {
    if (!userId) return
    lineApi
      .getProfile(userId)
      .then(setProfile)
      .catch((e: Error) => setProfileError(e.message))
  }, [userId])

  const summary = computeSummary(records)

  const stats = [
    { label: '送信メッセージ数', value: summary.totalMessages, icon: MessageCircle },
    { label: 'ユニークユーザー', value: summary.uniqueUsers, icon: Users },
    { label: '総文字数', value: summary.totalChars, icon: Hash },
    { label: '平均文字数', value: summary.averageLength, icon: Clock },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          ユーザープロフィール
        </h2>
        {profileError ? (
          <p className="text-red-500 text-sm">{profileError}</p>
        ) : profile ? (
          <div className="flex items-center gap-4">
            {profile.pictureUrl && (
              <img
                src={profile.pictureUrl}
                alt={profile.displayName}
                className="w-14 h-14 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900 text-lg">{profile.displayName}</p>
              {profile.statusMessage && (
                <p className="text-gray-500 text-sm mt-0.5">{profile.statusMessage}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">{profile.userId}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm animate-pulse">読み込み中...</p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-line-green" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Recent messages */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">最近の送信履歴</h2>
        </div>
        {records.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">まだメッセージを送信していません</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {records.slice(0, 10).map((r) => (
              <li key={r.id} className="px-6 py-3 flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                    r.status === 'sent' ? 'bg-line-green' : 'bg-red-400'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">{r.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(r.timestamp).toLocaleString('ja-JP')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
