import './globals.css'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Website Generator V2 Multi-Agents',
    template: '%s | Website Generator V2'
  },
  description: 'Générateur de sites web avec IA multi-agents - Performance optimisée, PWA, sécurité enterprise',
  keywords: ['générateur site web', 'IA multi-agents', 'performance', 'PWA', 'Next.js'],
  authors: [{ name: 'Website Generator Team' }],
  creator: 'Website Generator V2',
  publisher: 'Website Generator V2',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3334'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'Website Generator V2 Multi-Agents',
    description: 'Générateur de sites web avec IA multi-agents',
    siteName: 'Website Generator V2',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Generator V2',
    description: 'Générateur de sites web avec IA multi-agents',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#3b82f6',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased font-sans">
        <div id="root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
