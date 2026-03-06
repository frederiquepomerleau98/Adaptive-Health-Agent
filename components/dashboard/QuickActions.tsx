'use client'

import Link from 'next/link'

const actions = [
  { href: '/meals', label: 'Log a meal', icon: '🍽️', color: 'bg-green-50 text-green-700' },
  { href: '/activity', label: 'Log workout', icon: '💪', color: 'bg-blue-50 text-blue-700' },
  { href: '/ideas', label: 'Meal ideas', icon: '💡', color: 'bg-amber-50 text-amber-700' },
  { href: '/calendar', label: 'Calendar', icon: '📅', color: 'bg-purple-50 text-purple-700' },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`flex items-center gap-3 rounded-2xl p-4 transition-transform active:scale-95 ${action.color}`}
        >
          <span className="text-2xl">{action.icon}</span>
          <span className="text-sm font-medium">{action.label}</span>
        </Link>
      ))}
    </div>
  )
}
