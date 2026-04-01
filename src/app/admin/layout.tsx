import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'DHT Admin Portal',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
