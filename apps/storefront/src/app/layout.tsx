import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Hanken_Grotesk, Instrument_Serif, Space_Mono } from "next/font/google"
import { CartProvider } from "@modules/home/components/kult/cart-context"
import LenisProvider from "@modules/common/components/scroll/lenis-provider"
import "styles/globals.css"

// KULT — Serif pour l'émotion, mono pour le repère. Hanken pour le corps.
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
})

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "KULT Collection — Une maison pleine de soleil",
    template: "%s · KULT Collection",
  },
  description:
    "Bougies en céramique, faites main — entre le Sud de la France et la Californie.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      data-mode="light"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="bg-ivory font-sans text-ink antialiased">
        <CartProvider>
          <LenisProvider>
            <main className="relative">{props.children}</main>
          </LenisProvider>
        </CartProvider>
      </body>
    </html>
  )
}
