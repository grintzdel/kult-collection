import { PinIcon } from "./icons"

// « Voyagez entre nos deux boutiques » — carte des deux points de vente.
// Média non fourni : placeholder carte + deux marqueurs positionnés.

type Marker = {
  label: string
  city: string
  className: string
}

const markers: Marker[] = [
  {
    label: "KULT MARKET",
    city: "Paris 20e",
    className: "left-[46%] top-[42%]",
  },
  {
    label: "KULT MARKET",
    city: "Vincennes",
    className: "left-[70%] top-[64%]",
  },
]

const BoutiquesMap = () => {
  return (
    <section className="bg-ivory">
      <div className="kult-container pb-20 small:pb-28">
        <h2 className="display text-4xl text-ink small:text-5xl">
          Voyagez entre
          <br />
          nos deux boutiques
        </h2>

        <div className="relative mt-10 overflow-hidden rounded-large border border-ink/10">
          {/* Placeholder carte — grille façon plan quadrillé */}
          <div
            data-placeholder="carte-paris"
            className="aspect-[16/9] w-full bg-cream bg-[linear-gradient(to_right,rgba(43,32,24,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(43,32,24,0.06)_1px,transparent_1px)] bg-[size:40px_40px]"
          />

          {/* Marqueurs */}
          {markers.map((marker) => (
            <div
              key={marker.city}
              className={`absolute flex -translate-x-1/2 -translate-y-full flex-col items-center ${marker.className}`}
            >
              <div className="flex items-center gap-2 rounded-circle bg-ivory px-3 py-1.5 shadow-soft">
                <PinIcon className="h-4 w-4 text-terracotta" />
                <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-label text-ink">
                  {marker.label}
                  <span className="block normal-case tracking-normal text-ink/50">
                    {marker.city}
                  </span>
                </span>
              </div>
              <span className="mt-1 h-2 w-2 rotate-45 bg-ivory shadow-soft" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BoutiquesMap
