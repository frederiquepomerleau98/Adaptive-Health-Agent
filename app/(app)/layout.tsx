import Navigation from '@/components/Navigation'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      {/* Main content area — offset for sidebar on desktop */}
      <main className="min-h-screen w-full pb-20 lg:pl-64 lg:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </>
  )
}
