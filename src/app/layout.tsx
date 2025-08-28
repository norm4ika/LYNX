import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'N8N Ad-Genius - AI-Powered Creative Agency Portal',
  description: 'Transform your images into stunning advertisements with AI-powered creativity. Upload an image, describe your vision, and get a professional ad in minutes.',
  keywords: 'AI, advertisement, image generation, creative agency, N8N, artificial intelligence',
  authors: [{ name: 'N8N Ad-Genius Team' }],
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
