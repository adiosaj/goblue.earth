import type { Metadata } from 'next'
import './globals.css'
import NetworkBackground from '@/components/NetworkBackground'

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || 'GYC Champ Signal Mapper',
  description: 'Map your archetype. Build the future.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-solar-dark text-solar-green-50">
        <div className="network-bg" id="network-bg"></div>
        <NetworkBackground />
        {children}
      </body>
    </html>
  )
}

