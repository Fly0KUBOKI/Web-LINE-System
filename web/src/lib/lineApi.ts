import type {
  UserProfile,
  SendMessageResponse,
  RichMenuListResponse,
  TextMessage,
} from '@/types/line'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`)
  return data as T
}

export const lineApi = {
  getProfile(userId: string): Promise<UserProfile> {
    return request<UserProfile>(`/profile?userId=${encodeURIComponent(userId)}`)
  },

  sendMessages(userId: string, messages: TextMessage[]): Promise<SendMessageResponse> {
    return request<SendMessageResponse>('/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, messages }),
    })
  },

  sendText(userId: string, text: string): Promise<SendMessageResponse> {
    return lineApi.sendMessages(userId, [{ type: 'text', text }])
  },

  getRichMenus(): Promise<RichMenuListResponse> {
    return request<RichMenuListResponse>('/rich-menus')
  },
}
