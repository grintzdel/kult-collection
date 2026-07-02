import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import { Libre_Baskerville, League_Spartan } from "next/font/google"
import { CartProvider } from "@modules/home/components/kult/cart-context"
import LenisProvider from "@modules/common/components/scroll/lenis-provider"
import "styles/globals.css"

const sans = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

const serif = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
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
      className={`${sans.variable} ${serif.variable}`}
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