"use client"

import { useState } from "react"

const ITEMS = [
  {
    title: "Détails & matière",
    body: "Céramique émaillée, coulée à la main. Cire de soja végétale, mèche en coton. 220g, environ 50 heures de combustion. Contenant réutilisable une fois la cire épuisée.",
  },
  {
    title: "Rituel d'allumage",
    body: "Première combustion : laissez fondre la cire jusqu'aux bords pour éviter le tunnel. Recoupez la mèche à 5 mm avant chaque usage. Ne jamais laisser brûler plus de 4 heures.",
  },
  {
    title: "Livraison & retours",
    body: "Expédition soignée sous 2 à 4 jours ouvrés, emballage protecteur. Retours acceptés sous 14 jours, contenant non utilisé.",
  },
]

const KultProductAccordions = () => {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mt-10 border-t border-ink/10">
      {ITEMS.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.title} className="border-b border-ink/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-4 text-left font-mono text-[11px] uppercase tracking-label text-ink transition-colors hover:text-terracotta"
            >
              {item.title}
              <span className="text-base text-terracotta">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <p className="pb-5 pr-8 text-sm leading-[1.7] text-ink/70">
                {item.body}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default KultProductAccordions
