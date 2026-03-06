'use client'

import Link from 'next/link'

const actions = [
  {
    href: '/meals',
    label: 'Log meal',
    description: 'Text, photo, or voice',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    accent: 'group-hover:text-accent-400',
  },
  {
    href: '/activity',
    label: 'Get workout',
    description: 'AI-generated for today',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    ),
    accent: 'group-hover:text-violet-400',
  },
  {
    href: '/ideas',
    label: 'Meal ideas',
    description: 'Based on your macros',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    ),
    accent: 'group-hover:text-amber-400',
  },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group glass-card flex items-center gap-4 p-4 transition-all hover:border-white/10"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-200 transition-colors ${action.accent}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {action.icon}
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{action.label}</p>
            <p className="text-xs text-gray-500">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
