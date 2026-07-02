"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useCart } from "./cart-context"

const LEFT_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Notre Atelier", href: "/notre-atelier" },
]

const RIGHT_LINKS = [
  { label: "Nos Boutiques", href: "/nos-boutiques" },
  { label: "Contact", href: "/contact" },
]

const NAV_LINK_CLASS =
  "font-sans text-[11px] font-medium uppercase tracking-[0.18em] transition-colors hover:opacity-80"

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const SearchIcon = () => (
  <svg {...ICON_PROPS} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const UserIcon = () => (
  <svg {...ICON_PROPS} aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
)

const BagIcon = () => (
  <svg {...ICON_PROPS} aria-hidden="true">
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
)

const MenuIcon = () => (
  <svg {...ICON_PROPS} aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

const KultHeader = () => {
  const { count, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`fixed top-8 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "bg-[#FFF6EC] text-ink" : "bg-transparent text-white"}`}>
      <div className="mx-auto grid h-16 w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10">
        {/* Gauche */}
        <div className="flex items-center gap-9">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center small:hidden"
          >
            <MenuIcon />
          </button>
          <nav className="hidden items-center gap-9 small:flex">
            {LEFT_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.label}
                href={link.href}
                className={`${NAV_LINK_CLASS} ${scrolled ? "text-ink/80" : "text-white/90"}`}
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        {/* Centre : logo */}
        <LocalizedClientLink
          href="/"
          className={`justify-self-center font-serif text-[26px] leading-none tracking-[0.3em] ${scrolled ? "text-ink" : "text-white"}`}
          data-testid="nav-store-link"
        >
          KULT
        </LocalizedClientLink>

        {/* Droite */}
        <div className="flex items-center justify-end gap-7">
          <nav className="hidden items-center gap-7 small:flex">
            {RIGHT_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.label}
                href={link.href}
                className={`${NAV_LINK_CLASS} ${scrolled ? "text-ink/80" : "text-white/90"}`}
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <LocalizedClientLink
              href="/search"
              aria-label="Rechercher"
              className={`transition-colors hover:opacity-80 ${scrolled ? "text-ink/80" : "text-white/80"}`}
            >
              <SearchIcon />
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account"
              aria-label="Mon compte"
              data-testid="nav-account-link"
              className={`transition-colors hover:opacity-80 ${scrolled ? "text-ink/80" : "text-white/80"}`}
            >
              <UserIcon />
            </LocalizedClientLink>
            <button
              type="button"
              onClick={openCart}
              aria-label="Ouvrir le panier"
              data-testid="nav-cart-link"
              className={`relative transition-colors hover:opacity-80 ${scrolled ? "text-ink/80" : "text-white/80"}`}
            >
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-circle bg-soleil px-1 font-mono text-[9px] text-ink">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav className={`border-t border-ink/10 px-6 py-4 small:hidden ${scrolled ? "bg-[#FFF6EC]" : "bg-black/50"}`}>
          <ul className="flex flex-col gap-4">
            {[...LEFT_LINKS, ...RIGHT_LINKS].map((link) => (
              <li key={link.label}>
                <LocalizedClientLink
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`${NAV_LINK_CLASS} ${scrolled ? "text-ink/80" : "text-white/90"}`}
                >
                  {link.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

export default KultHeader