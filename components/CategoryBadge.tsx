import { Category } from '@/types/database'

const CATEGORY_STYLES: Record<Category, { label: string; className: string }> = {
  club: { label: '🎵 Club', className: 'bg-purple-100 text-purple-700' },
  sports: { label: '⚽ Sports', className: 'bg-green-100 text-green-700' },
  racing: { label: '🐎 Racing', className: 'bg-yellow-100 text-yellow-700' },
  other: { label: '✨ Other', className: 'bg-blue-100 text-blue-700' },
}

export default function CategoryBadge({ category }: { category: Category }) {
  const style = CATEGORY_STYLES[category]
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${style.className}`}>
      {style.label}
    </span>
  )
}
