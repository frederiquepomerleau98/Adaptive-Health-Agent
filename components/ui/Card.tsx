interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`glass-card p-5 ${hover ? 'transition-colors hover:border-white/10' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
