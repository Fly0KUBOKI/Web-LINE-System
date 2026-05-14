import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MessageRecord } from '@/types/line'

interface MessageStore {
  records: MessageRecord[]
  addRecord: (record: MessageRecord) => void
  clear: () => void
}

const MessageStoreContext = createContext<MessageStore | null>(null)

export function MessageStoreProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<MessageRecord[]>([])

  const addRecord = (record: MessageRecord) =>
    setRecords((prev) => [record, ...prev])

  const clear = () => setRecords([])

  return (
    <MessageStoreContext.Provider value={{ records, addRecord, clear }}>
      {children}
    </MessageStoreContext.Provider>
  )
}

export function useMessageStore(): MessageStore {
  const ctx = useContext(MessageStoreContext)
  if (!ctx) throw new Error('useMessageStore must be used inside MessageStoreProvider')
  return ctx
}
