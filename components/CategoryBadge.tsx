import { Category } from '@/types/database'

const CATEGORY_STYLES: Record<Category, { label: string; className: string }> = {
  club: { label: '🎵 Club', className: 'bg-purple-500/20 text-purple-300' },
  sports: { label: '⚽ Sports', className: 'bg-green-500/20 text-green-300' },
  racing: { label: '🐎 Racing', className: 'bg-yellow-500/20 text-yellow-300' },
  other: { label: '✨ Other', className: 'bg-blue-500/20 text-blue-300' },
}

export default function CategoryBadge({ category }: { category: Category }) {
  const style = CATEGORY_STYLES[category]
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${style.className}`}>
      {style.label}
    </span>
  )
}
