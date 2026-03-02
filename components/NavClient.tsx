'use client'

import Link from 'next/link'

export default function NavClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return (
      <div className="flex gap-3">
        <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2">
          Log In
        </Link>
        <Link href="/auth/signup" className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-1">
      <Link href="/events" className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10">
        Events
      </Link>
      <Link href="/messages" className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10">
        Messages
      </Link>
      <Link href="/profile" className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10">
        Profile
      </Link>
    </div>
  )
}
