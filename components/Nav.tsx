import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NavClient from './NavClient'

export default async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="bg-[#111111] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user ? '/events' : '/'} className="text-xl font-bold text-white">
          🎫 ShefTickets
        </Link>
        <NavClient isLoggedIn={!!user} />
      </div>
    </nav>
  )
}
