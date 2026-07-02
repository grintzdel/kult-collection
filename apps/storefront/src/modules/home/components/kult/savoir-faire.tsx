type Boutique = {
  name: string
  address: string
  phone: string
  horaires: string[]
  color: string
}

const BOUTIQUES: Boutique[] = [
  {
    name: "KULT Vincennes",
    address: "8 Rue Raymond du Temple, 94300 Vincennes",
    phone: "+33 6 51 67 86 32",
    horaires: [
      "Mardi - Samedi : 12H30 - 14h30 / 15H30 - 19h30",
      "Dimanche & Lundi : fermé",
    ],
    color: "border-blue-500",
  },
  {
    name: "KULT Paris 20ᵉ",
    address: "21 Rue du Borrégo, 75020 Paris",
    phone: "+33 6 51 67 86 32",
    horaires: [
      "Mardi - Samedi : 11H30 / 19H00",
      "Dimanche & Lundi : fermé",
    ],
    color: "border-yellow-400",
  },
]

const KultSavoirFaire = () => {
  return (
    <section className="bg-[#fdf6ee] py-24">
      <div className="max-w-6xl mx-auto px-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="block w-6 h-0.5 bg-blue-500"></span>
          <span className="text-blue-500 text-xs uppercase tracking-widest">Rendez nous visite</span>
        </div>
        <h2 className="font-serif text-5xl text-ink mb-16">
          Nos Boutiques
        </h2>

        <div className="grid grid-cols-2 gap-8">
          {BOUTIQUES.map((boutique) => (
            <div
              key={boutique.name}
              className={`bg-white rounded-lg p-8 border-t-4 ${boutique.color} shadow-sm`}
            >
              <h3 className="font-serif text-xl text-ink mb-6">
                {boutique.name}
              </h3>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-start gap-2 text-ink/60 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>{boutique.address}</span>
                </div>
                <div className="flex items-center gap-2 text-ink/60 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{boutique.phone}</span>
                </div>
              </div>

              <div className="border-t border-ink/10 pt-4">
                <span className="text-xs uppercase tracking-widest text-ink mb-2 block">Horaires</span>
                {boutique.horaires.map((h, i) => (
                  <p key={i} className="text-ink/60 text-sm">{h}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default KultSavoirFaire