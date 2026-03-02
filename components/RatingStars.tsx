export default function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-lg ${i <= fullStars ? 'text-yellow-400' : i === fullStars + 1 && hasHalf ? 'text-yellow-300' : 'text-gray-200'}`}>
          ★
        </span>
      ))}
    </div>
  )
}
