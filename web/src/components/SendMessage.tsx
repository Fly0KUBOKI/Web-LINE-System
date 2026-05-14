import { useState, useId } from 'react'
import { Send, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { lineApi } from '@/lib/lineApi'
import { useMessageStore } from '@/components/MessageStoreContext'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function SendMessage() {
  const defaultUserId = import.meta.env.VITE_LINE_USER_ID as string
  const [userId, setUserId] = useState(defaultUserId ?? '')
  const [lines, setLines] = useState<string[]>([''])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const { addRecord } = useMessageStore()
  const uid = useId()

  const updateLine = (i: number, value: string) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? value : l)))

  const addLine = () => setLines((prev) => [...prev, ''])

  const removeLine = (i: number) =>
    setLines((prev) => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const texts = lines.map((l) => l.trim()).filter(Boolean)
    if (!userId.trim() || texts.length === 0) return

    setStatus('loading')
    setErrorMsg('')

    try {
      await lineApi.sendMessages(
        userId.trim(),
        texts.map((text) => ({ type: 'text' as const, text })),
      )
      texts.forEach((text) =>
        addRecord({
          id: `${Date.now()}-${Math.random()}`,
          userId: userId.trim(),
          text,
          timestamp: new Date(),
          status: 'sent',
        }),
      )
      setStatus('success')
      setLines([''])
      setTimeout(() => setStatus('idle'), 3000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '送信に失敗しました'
      setErrorMsg(msg)
      setStatus('error')
      addRecord({
        id: `${Date.now()}-err`,
        userId: userId.trim(),
        text: texts.join(' / '),
        timestamp: new Date(),
        status: 'error',
      })
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">メッセージ送信</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* User ID */}
        <div>
          <label htmlFor={`${uid}-uid`} className="block text-sm font-medium text-gray-700 mb-1">
            送信先 User ID
          </label>
          <input
            id={`${uid}-uid`}
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent"
            placeholder="U37cbb..."
            required
          />
        </div>

        {/* Message lines */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">メッセージ内容</p>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => updateLine(i, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent"
                  placeholder={`メッセージ ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {lines.length < 5 && (
            <button
              type="button"
              onClick={addLine}
              className="mt-2 flex items-center gap-1 text-sm text-line-green hover:text-line-dark font-medium"
            >
              <Plus className="w-4 h-4" />
              メッセージを追加
            </button>
          )}
        </div>

        {/* Status feedback */}
        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            送信しました
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 rounded-lg px-4 py-3 text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center gap-2 px-5 py-2.5 bg-line-green text-white rounded-lg text-sm font-semibold hover:bg-line-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {status === 'loading' ? '送信中...' : '送信'}
        </button>
      </form>
    </div>
  )
}
