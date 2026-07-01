"use client"

import { useCart } from "./cart-context"

const NAV_LINKS = [
  { label: "Boutique", href: "/store" },
  { label: "Collections", href: "/collections" },
  { label: "Savoir-faire", href: "#savoir-faire" },
  { label: "Journal", href: "#journal" },
]

const KultHeader = () => {
  const { count, openCart } = useCart()

  return (
    <header className="relative z-40 bg-ink text-ivory">
      {/* Bandeau annonce */}
      <div className="border-b border-ivory/10">
        <p className="kult-container py-2.5 text-center font-mono text-[10px] uppercase tracking-label text-ivory/70">
          Fait main à Grasse · Cire de soja végétale · Contenant réutilisable
        </p>
      </div>

      {/* Navigation */}
      <nav className="kult-container flex h-20 items-center justify-between">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-3xl leading-none">KULT</span>
          <span className="eyebrow text-soleil">Maison</span>
        </a>

        <ul className="hidden items-center gap-9 small:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-label text-ivory/70 transition-colors hover:text-ivory"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <a
            href="#"
            className="hidden font-mono text-[11px] uppercase tracking-label text-ivory/70 transition-colors hover:text-ivory xsmall:inline"
          >
            Recherche
          </a>
          <a
            href="/account"
            className="hidden font-mono text-[11px] uppercase tracking-label text-ivory/70 transition-colors hover:text-ivory xsmall:inline"
          >
            Compte
          </a>
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-ivory transition-opacity hover:opacity-80"
          >
            Panier
            <span className="flex h-5 min-w-5 items-center justify-center rounded-circle bg-soleil px-1 text-[10px] text-ink">
              {count}
            </span>
          </button>
        </div>
      </nav>
    </header>
  )
}

export default KultHeader
