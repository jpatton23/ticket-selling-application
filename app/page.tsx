import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/events')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-5xl font-bold mb-4">Sheffield Ticket Marketplace</h1>
        <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
          Buy and sell tickets for Sheffield University events. Club nights, sports, races and more — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-purple-500 hover:bg-purple-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/login"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg transition-colors border border-white/30"
          >
            Log In
          </Link>
        </div>
        <p className="mt-6 text-purple-300 text-sm">
          For @sheffield.ac.uk and @shu.ac.uk email addresses only
        </p>
      </div>
    </div>
  )
}
