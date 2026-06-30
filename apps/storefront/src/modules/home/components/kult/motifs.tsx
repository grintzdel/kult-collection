type Motif = {
  name: string
  tagline: string
  surface: string
}

const MOTIFS: Motif[] = [
  { name: "Damier", tagline: "Le jeu, en pots", surface: "motif-damier" },
  { name: "Léopard", tagline: "Le grain sauvage", surface: "motif-leopard" },
  { name: "Rayures", tagline: "Le plein soleil", surface: "motif-rayures" },
]

const KultMotifs = () => {
  return (
    <section className="bg-marine text-ivory">
      <div className="kult-container py-24 small:py-28">
        <div className="text-center">
          <span className="eyebrow text-ivory/50">Nos motifs</span>
          <h2 data-split className="display mt-4 text-4xl small:text-5xl">
            Damier, léopard,{" "}
            <span className="italic text-soleil">rayures.</span>
          </h2>
        </div>

        <div data-reveal-group className="mt-14 grid gap-6 small:grid-cols-3">
          {MOTIFS.map((motif) => (
            <div
              key={motif.name}
              className="group relative aspect-square overflow-hidden rounded-large shadow-soft"
            >
              <div
                className={`absolute inset-0 ${motif.surface} transition-transform duration-700 ease-out group-hover:scale-105`}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-5">
                <h3 className="font-serif text-2xl text-ivory">{motif.name}</h3>
                <span className="eyebrow text-ivory/70">{motif.tagline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default KultMotifs
