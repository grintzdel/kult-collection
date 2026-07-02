import { boutiques, type Boutique } from "../data"
import { ClockIcon, PhoneIcon, PinIcon } from "./icons"

// Carte postale — les deux adresses, façon maquette (bord perforé bleu,
// visuel timbré à droite). Média non fourni : placeholder.

const BoutiqueDetails = ({ boutique }: { boutique: Boutique }) => (
  <div>
    <span className="eyebrow text-ink/50">{boutique.name}</span>

    <ul className="mt-4 space-y-3 text-sm text-ink/80">
      <li className="flex items-start gap-3">
        <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
        <span>{boutique.address}</span>
      </li>
      <li className="flex items-start gap-3">
        <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
        <span>
          {boutique.hours.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </span>
      </li>
      <li className="flex items-start gap-3">
        <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
        <a href={`tel:${boutique.phone.replace(/\s/g, "")}`} className="hover:text-ink">
          {boutique.phone}
        </a>
      </li>
    </ul>
  </div>
)

const BoutiquesPostcard = () => {
  return (
    <section className="bg-ivory">
      <div className="kult-container pb-16 small:pb-20">
        <div className="rounded-large border-2 border-dashed border-marine/60 bg-cream/40 p-6 shadow-soft small:p-10">
          <div className="grid gap-10 small:grid-cols-[1.1fr_auto_1fr] small:items-stretch">
            {/* Colonne gauche — titre + adresses */}
            <div>
              <h2 className="display text-4xl text-ink small:text-5xl">
                Vincennes &amp;
                <br />
                Paris 20e
              </h2>

              <div className="mt-8 space-y-8">
                {boutiques
                  .slice()
                  .reverse()
                  .map((boutique) => (
                    <BoutiqueDetails key={boutique.slug} boutique={boutique} />
                  ))}
              </div>
            </div>

            {/* Séparateur central vertical + mention postale */}
            <div className="hidden small:flex small:flex-col small:items-center">
              <div className="w-px flex-1 border-l border-dashed border-marine/40" />
              <span className="my-4 rotate-180 font-mono text-[9px] uppercase tracking-label text-ink/30 [writing-mode:vertical-rl]">
                Postcard — No. 019
              </span>
              <div className="w-px flex-1 border-l border-dashed border-marine/40" />
            </div>

            {/* Colonne droite — visuel timbré (placeholder) */}
            <div className="relative flex items-center justify-center">
              <div
                data-placeholder="postcard-visuel"
                className="flex aspect-[3/4] w-full max-w-xs rotate-2 items-center justify-center rounded-base bg-sand shadow-lift"
              >
                <span className="eyebrow text-ink/30">Visuel boutique</span>
              </div>
              {/* Tampon postal décoratif */}
              <div className="absolute -right-1 -top-3 flex h-16 w-16 rotate-12 items-center justify-center rounded-circle border-2 border-marine/50 text-center font-mono text-[8px] uppercase leading-tight tracking-label text-marine/60">
                KULT
                <br />
                market
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BoutiquesPostcard
