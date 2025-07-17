import type { Metadata } from 'next'
import { HomePage } from '@/components/pages/home'

export const metadata: Metadata = {
  title: "Enostics – Universal Personal API Layer",
  description: "Every person deserves their own programmable endpoint. Connect anything, control everything, own your data — live and private.",
  openGraph: {
    title: "Enostics – Universal Personal API Layer",
    description: "Every person deserves their own programmable endpoint. Connect anything, control everything, own your data — live and private.",
    type: "website",
    url: "https://enostics.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Enostics - Universal Personal API Layer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enostics – Universal Personal API Layer",
    description: "Every person deserves their own programmable endpoint. Connect anything, control everything, own your data — live and private.",
    images: ["/og-image.png"],
  },
}

export default function Page() {
  return <HomePage />
}


