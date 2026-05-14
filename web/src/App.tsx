import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/components/Dashboard'
import SendMessage from '@/components/SendMessage'
import Analytics from '@/components/Analytics'
import { MessageStoreProvider } from '@/components/MessageStoreContext'

export default function App() {
  return (
    <MessageStoreProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="send" element={<SendMessage />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </MessageStoreProvider>
  )
}
