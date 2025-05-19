import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import WalletProviders from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZK-DCA - Privacy-Preserving Dollar-Cost Averaging',
  description: 'A privacy-preserving Dollar-Cost Averaging protocol on Aleo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProviders>
          {children}
        </WalletProviders>
      </body>
    </html>
  )
}
