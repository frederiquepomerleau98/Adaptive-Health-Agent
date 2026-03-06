import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Adaptive Health Agent',
  description: 'Your AI-powered health companion',
}

export const viewport: Viewport = {
  themeColor: '#0c0c10',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans">
        <div className="flex min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
