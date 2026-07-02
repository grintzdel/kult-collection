import { listCollections } from "@lib/data/collections"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import FooterNewsletter from "./footer-newsletter"

const EXPLORER_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Notre Atelier", href: "/notre-atelier" },
  { label: "Nos Boutiques", href: "/nos-boutiques" },
]

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGV", href: "/cgv" },
]

const COLUMN_TITLE_CLASS =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-ink"

const COLUMN_LINK_CLASS =
  "font-sans text-[15px] text-ink/70 transition-colors hover:text-ink"

const KultFooter = async () => {
  const { collections } = await listCollections({ fields: "id,title,handle" })
  const featuredCollections = collections.slice(0, 5)
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ivory text-ink">
      {/* — Ruban décoratif soleil — */}
      <div
        className="h-[10px] w-full"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #E7A93A 25%, transparent 25%, transparent 75%, #E7A93A 75%), linear-gradient(45deg, #E7A93A 25%, transparent 25%, transparent 75%, #E7A93A 75%)",
          backgroundSize: "18px 18px",
          backgroundPosition: "0 0, 9px 9px",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10">
        <div className="grid gap-12 py-16 small:grid-cols-[1.6fr_1fr_1fr_1.4fr] small:py-20">
          {/* — Marque — */}
          <div>
            <span className="font-serif text-[28px] leading-none tracking-[0.28em] text-ink">
              KULT
            </span>
            <p className="mt-6 max-w-xs font-sans text-[15px] leading-relaxed text-ink/70">
              Objets artisanaux inspirés des vacances et du voyage. Faits à la
              main, pour les belles tables.
            </p>
            <a
              href="https://instagram.com/kultcollection"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2.5 font-sans text-[15px] text-ink/70 transition-colors hover:text-ink"
            >
              <InstagramIcon />
              @kultcollection
            </a>
          </div>

          {/* — Explorer — */}
          <div>
            <span className={COLUMN_TITLE_CLASS}>Explorer</span>
            <ul className="mt-6 flex flex-col gap-4">
              {EXPLORER_LINKS.map((link) => (
                <li key={link.label}>
                  <LocalizedClientLink
                    href={link.href}
                    className={COLUMN_LINK_CLASS}
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* — Collections (dynamiques) — */}
          <div>
            <span className={COLUMN_TITLE_CLASS}>Collections</span>
            <ul className="mt-6 flex flex-col gap-4">
              {featuredCollections.map((collection) => (
                <li key={collection.id}>
                  <LocalizedClientLink
                    href={`/collections/${collection.handle}`}
                    className={COLUMN_LINK_CLASS}
                  >
                    {collection.title}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* — Newsletter — */}
          <div>
            <span className={COLUMN_TITLE_CLASS}>Newsletter</span>
            <p className="mt-6 max-w-sm font-sans text-[15px] leading-relaxed text-ink/70">
              Les nouvelles collections, les événements, les histoires.
            </p>
            <FooterNewsletter />
          </div>
        </div>

        {/* — Bas de page — */}
        <div className="flex flex-col gap-4 border-t border-ink/10 py-8 small:flex-row small:items-center small:justify-between">
          <p className="font-sans text-[13px] text-ink/50">
            © {year} KULT Collection — Tous droits réservés
          </p>
          <ul className="flex items-center gap-8">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <LocalizedClientLink
                  href={link.href}
                  className="font-sans text-[13px] text-ink/50 transition-colors hover:text-ink"
                >
                  {link.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

const InstagramIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export default KultFooter
