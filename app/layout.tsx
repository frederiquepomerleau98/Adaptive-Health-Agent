import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Adaptive Health Agent',
  description: 'Your personal AI-powered health co-pilot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans text-gray-900 antialiased">
        <main className="mx-auto min-h-screen max-w-lg pb-20">
          {children}
        </main>
      </body>
    </html>
  )
}
