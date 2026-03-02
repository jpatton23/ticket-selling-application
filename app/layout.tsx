import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Sheffield Ticket Marketplace',
  description: 'Buy and sell event tickets for Sheffield University students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Nav />
        <main className="min-h-screen bg-[#0a0a0a]">
          {children}
        </main>
      </body>
    </html>
  )
}
