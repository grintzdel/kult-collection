"use client"

import { useState } from "react"

type Section = { title: string; body: string }

const KultProductAccordions = ({ sections }: { sections: Section[] }) => {
  const [open, setOpen] = useState<number | null>(null)

  if (sections.length === 0) {
    return null
  }

  return (
    <div className="mt-10 border-t border-ink/10">
      {sections.map((item, i) => {
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
              <p className="whitespace-pre-line pb-5 pr-8 text-sm leading-[1.7] text-ink/70">
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
