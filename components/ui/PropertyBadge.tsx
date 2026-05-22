interface PropertyBadgeProps {
  type: 'featured' | 'new'
  className?: string
}

export default function PropertyBadge({ type, className = '' }: PropertyBadgeProps) {
  if (type === 'featured') {
    return (
      <span className={`badge-top ${className}`}>
        Топ оферта
      </span>
    )
  }
  return (
    <span className={`badge-new ${className}`}>
      Нова оферта
    </span>
  )
}
