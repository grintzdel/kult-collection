import LocalizedClientLink from "@modules/common/components/localized-client-link"

import type { CustomPieceContent } from "../../lib/custom-piece"

type CustomPieceProps = {
  content: CustomPieceContent
}

/** Grille fine façon papier millimétré (motif de fond de la maquette). */
const gridStyle = {
  backgroundImage:
    "linear-gradient(rgba(43,32,24,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(43,32,24,0.10) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
} as const

/**
 * Section « pièce personnalisée » (contenu par catégorie). Bloc jaune à la
 * grille et aux bords pointillés, tampons KULT, visuel polaroïd incliné, titre +
 * paragraphe + CTA vert. Masquée quand la catégorie ne fournit pas de contenu.
 */
const CustomPiece = ({ content }: CustomPieceProps) => {
  return (
    <section className="bg-ivory">
      <div className="content-container py-10 small:py-14">
        <div className="relative overflow-hidden rounded-large bg-[#F6C544]">
          {/* Grille papier millimétré */}
          <div
            className="pointer-events-none absolute inset-0"
            style={gridStyle}
          />
          {/* Bords pointillés haut / bas */}
          <div className="pointer-events-none absolute inset-x-6 top-4 border-t-2 border-dashed border-[#267F53]" />
          <div className="pointer-events-none absolute inset-x-6 bottom-4 border-t-2 border-dashed border-[#267F53]" />

          {/* Tampons KULT */}
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src="/kult/Group 54.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute right-8 top-7 z-10 hidden w-28 small:block"
          />
          <img
            src="/kult/tamp 1.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute right-40 top-12 z-10 hidden w-20 rotate-6 small:block"
          />
          {/* eslint-enable @next/next/no-img-element */}

          <div className="relative grid items-center gap-8 p-8 small:grid-cols-2 small:gap-14 small:p-14">
            {/* Visuel polaroïd incliné */}
            <div className="flex justify-center small:justify-start">
              <div className="w-[68%] max-w-xs -rotate-6 bg-white p-3 pb-8 shadow-lift">
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-ivory">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.image}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Texte + CTA */}
            <div>
              {content.kicker && (
                <span className="eyebrow text-[#267F53]">
                  — {content.kicker}
                </span>
              )}
              <h2 className="display mt-3 text-4xl text-ink small:text-5xl">
                {content.title}
              </h2>
              <p className="mt-6 max-w-lg text-base leading-[1.7] text-ink/80">
                {content.text}
              </p>
              <LocalizedClientLink
                href={content.cta_url}
                className="mt-8 inline-flex items-center gap-2 rounded-circle bg-[#267F53] px-7 py-3 font-mono text-[11px] uppercase tracking-label text-ivory transition-[filter] hover:brightness-110"
              >
                {content.cta_label} <span aria-hidden>→</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CustomPiece
