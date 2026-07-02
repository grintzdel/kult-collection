// Données des deux boutiques KULT market — maquette `Boutiques.pdf`.
// Statique pour l'instant (pas de source CMS).

export type Boutique = {
  slug: string
  name: string
  address: string
  hours: string[]
  phone: string
}

export const boutiques: Boutique[] = [
  {
    slug: "paris-20e",
    name: "Paris 20e",
    address: "21 Rue du Borrégo, 75020 Paris",
    hours: ["Mardi - Samedi : 11H30 / 19H00", "Dimanche & Lundi : fermé"],
    phone: "+33 6 51 67 86 32",
  },
  {
    slug: "vincennes",
    name: "Vincennes",
    address: "8 Rue Raymond du Temple, 94300 Vincennes",
    hours: [
      "Mardi - Samedi : 12H30 - 14h30 / 15H30 - 19h30",
      "Dimanche & Lundi : fermé",
    ],
    phone: "+33 6 70 47 71 68",
  },
]
