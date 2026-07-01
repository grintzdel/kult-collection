const COLUMNS = [
  {
    title: "Collection",
    links: ["Soleil", "Marine", "Terracotta", "Amore"],
  },
  {
    title: "Maison",
    links: ["Savoir-faire", "Atelier", "Engagements", "Journal"],
  },
  {
    title: "Suivre",
    links: ["Instagram", "Pinterest", "Contact"],
  },
]

const KultFooter = () => {
  return (
    <footer className="bg-ink text-ivory">
      {/* Colonnes */}
      <div className="kult-container grid gap-12 py-16 small:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <span className="font-serif text-3xl">KULT</span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/60">
            Bougies en céramique, faites main. Sud de la France × Californie.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <span className="eyebrow text-ivory/40">{col.title}</span>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-ivory/70 transition-colors hover:text-ivory"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bas de page */}
      <div className="border-t border-ivory/10">
        <div className="kult-container flex flex-col gap-2 py-6 text-center font-mono text-[10px] uppercase tracking-label text-ivory/40 small:flex-row small:justify-between">
          <span>© 2026 KULT Collection</span>
          <span>Fait main · Grasse · Los Angeles</span>
        </div>
      </div>
    </footer>
  )
}

export default KultFooter
