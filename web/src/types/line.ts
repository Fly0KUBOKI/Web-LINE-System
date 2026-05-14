export interface UserProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
  language?: string
}

export interface TextMessage {
  type: 'text'
  text: string
}

export interface SendMessageRequest {
  userId: string
  messages: TextMessage[]
}

export interface SentMessage {
  id: string
  quoteToken: string
}

export interface SendMessageResponse {
  sentMessages: SentMessage[]
}

export interface RichMenu {
  richMenuId: string
  name: string
  size: { width: number; height: number }
  selected: boolean
  areas: unknown[]
}

export interface RichMenuListResponse {
  richmenus: RichMenu[]
}

export interface MessageRecord {
  id: string
  userId: string
  text: string
  timestamp: Date
  status: 'sent' | 'error'
}

export interface AnalyticsSummary {
  totalMessages: number
  uniqueUsers: number
  totalChars: number
  averageLength: number
  byHour: Record<number, number>
}
