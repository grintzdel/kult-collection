import { getProContext } from "@lib/data/pro"
import { Metadata } from "next"
import KultCollection from "@modules/home/components/kult/collection"
import KultNewsletter from "@modules/home/components/kult/newsletter"
import { listProducts } from "@lib/data/products"
import { toPieces } from "@modules/home/components/kult/pieces"
import EnveloppeShake from "@modules/home/components/kult/enveloppe-shake"

export const metadata: Metadata = {
  title: "Espace Pro — KULT",
  description: "Des céramiques artisanales et des bougies sur-mesure conçues pour sublimer l'expérience de vos clients.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function ProLandingPage(props: Props) {
  const { countryCode } = await props.params

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 3 },
  })

  const featured = toPieces(products)

  return (
    <>
      {/* HERO B2B */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/kult/vid2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex h-full flex-col justify-start px-16 pt-48">
          <h1 className="font-serif text-8xl leading-tight text-white max-w-3xl">
            KULT,
            <br />
            dans chaque lieu.
          </h1>
          <p className="mt-6 text-white/80 max-w-sm text-base leading-relaxed">
            Des céramiques artisanales et des bougies sur-mesure conçues pour sublimer l'expérience de vos clients — à votre image.
          </p>
          <div className="mt-10 flex gap-4">
            <a href="/collections" className="inline-flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm uppercase tracking-widest text-white">
              Découvrir nos collections
            </a>
            <a href="#devis" className="inline-flex items-center gap-2 rounded-full border border-white px-6 py-3 text-sm uppercase tracking-widest text-white">
              Demander un devis
            </a>
          </div>
        </div>

        <img
          src="/kult/separateur.png"
          alt="separateur"
          className="absolute bottom-0 left-0 right-0 w-full z-10"
        />
      </section>

      {/* CRAFTED FOR MEMORABLE HOSPITALITY */}
      <section className="bg-[#fdf6ee] py-24">
        <div className="max-w-6xl mx-auto px-10">
          <div className="flex justify-between items-start mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-6 h-0.5 bg-blue-500"></span>
                <span className="text-blue-500 text-xs uppercase tracking-widest">Pourquoi Kult</span>
              </div>
              <h2 className="font-serif text-5xl text-ink">
                Crafted for<br />memorable hospitality
              </h2>
              <p className="mt-6 text-ink/70 leading-relaxed">
                Chaque pièce KULT est pensée pour créer une <strong>expérience visuelle et sensorielle inoubliable</strong> pour vos clients.
              </p>
            </div>
            <img src="/kult/sticker3.png" alt="Kult" className="w-32 opacity-90" />
          </div>

          {/* 4 stats */}
          <div className="grid grid-cols-4 border border-ink/10">
            <div className="p-8 border-r border-ink/10">
              <span className="font-serif text-4xl text-yellow-500">40+</span>
              <p className="text-xs uppercase tracking-widest text-ink mt-4 mb-2">Établissements équipés</p>
              <p className="text-ink/60 text-sm">Hôtels, restaurants et boutiques en France et à l'international.</p>
            </div>
            <div className="p-8 border-r border-ink/10">
              <span className="text-pink-500 text-4xl">✦</span>
              <p className="text-xs uppercase tracking-widest text-ink mt-4 mb-2">Sur-mesure</p>
              <p className="text-ink/60 text-sm">Matériaux, couleurs, messages et motifs personnalisés à votre identité.</p>
            </div>
            <div className="p-8 border-r border-ink/10">
              <span className="font-serif text-4xl text-blue-400">100%</span>
              <p className="text-xs uppercase tracking-widest text-ink mt-4 mb-2">Éco-conçu</p>
              <p className="text-ink/60 text-sm">Cire végétale, céramiques artisanales sans additifs, fabriqué en Europe.</p>
            </div>
            <div className="p-8">
              <span className="font-serif text-4xl text-green-600">4–6 sem</span>
              <p className="text-xs uppercase tracking-widest text-ink mt-4 mb-2">Délai de livraison garanti</p>
              <p className="text-ink/60 text-sm">De la validation du brief à la livraison en boutique ou à l'hôtel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS - réutilisé */}
      <KultCollection pieces={featured} />

      {/* DESTINATIONS - fond vert */}
      <section className="overflow-hidden">
        <div className="bg-[#fdf6ee]">
          <img src="/kult/sep3.png" alt="separateur" className="w-full" />
        </div>
        <div className="bg-[#2d6a4f] py-32">
          <div className="max-w-6xl mx-auto px-10 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="text-white text-xs uppercase tracking-widest">Votre carte postale</span>
            </div>
            <h2 className="font-serif text-5xl text-white">
              Choisissez votre destination
            </h2>
          </div>
          <div
            className="flex gap-6 px-10 overflow-x-auto cursor-grab active:cursor-grabbing"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[
              { name: "California", image: "/kult/imgh1.png" },
              { name: "Palm Beach", image: "/kult/imgh2.png" },
              { name: "Riviera", image: "/kult/imgh3.png" },
              { name: "Capri", image: "/kult/imgh4.png" },
            ].map((dest) => (
              <div key={dest.name} className="flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
                <img src={dest.image} alt={dest.name} className="h-[650px] w-auto object-contain rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#fdf6ee]">
          <img src="/kult/sep4.png" alt="separateur" className="w-full" />
        </div>
      </section>

      {/* FORMULAIRE DEVIS */}
      <section id="devis" className="bg-[#fdf6ee] py-24">
        <div className="max-w-6xl mx-auto px-10 grid grid-cols-2 gap-16 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="block w-6 h-0.5 bg-blue-500"></span>
              <span className="text-blue-500 text-xs uppercase tracking-widest">Contact Pro</span>
            </div>
            <h2 className="font-serif text-5xl text-ink mb-6">
              Demandez<br />votre devis.
            </h2>
            <p className="text-ink/70 leading-relaxed mb-10">
              Notre équipe vous répond sous 48h avec une proposition personnalisée. Collections standards ou sur-mesure complet — nous nous adaptons à votre projet.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-ink block mb-2">Nom & Prénom</label>
                <input type="text" placeholder="Marie Dupont" className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-ink block mb-2">Société</label>
                <input type="text" placeholder="Hôtel Les Palmiers" className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-ink block mb-2">Email</label>
                <input type="email" placeholder="marie@hotelpalmiers.fr" className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-ink block mb-2">Type d'établissement</label>
                <input type="text" placeholder="Hôtel 4★, restaurant, spa..." className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none" />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs uppercase tracking-widest text-ink block mb-2">Nombre de couverts / chambres</label>
              <input type="text" placeholder="ex. 80 couverts, 45 chambres" className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none" />
            </div>

            <div className="mb-10">
              <label className="text-xs uppercase tracking-widest text-ink block mb-2">Votre projet</label>
              <textarea placeholder="Décrivez votre projet, les collections qui vous intéressent, vos contraintes de délai..." className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none resize-none h-24" />
            </div>

            <div className="flex items-center gap-6">
              <button className="inline-flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm uppercase tracking-widest text-white">
                Envoyer la demande
              </button>
              <a href="#" className="text-sm uppercase tracking-widest text-ink underline underline-offset-4">
                Télécharger le catalogue →
              </a>
            </div>
            <p className="mt-4 text-xs text-ink/40">Réponse garantie sous 48h</p>
          </div>

          {/* Image enveloppe avec shake */}
          <div className="flex items-center justify-center">
            <EnveloppeShake />
          </div>
        </div>
      </section>

      {/* ILS NOUS FONT CONFIANCE */}
      <section className="relative py-24 overflow-hidden">
        <img src="/kult/imgt2.png" alt="background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-6xl mx-auto px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-yellow-400"></span>
            <span className="text-yellow-400 text-xs uppercase tracking-widest">Références</span>
          </div>
          <h2 className="font-serif text-5xl text-white mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-white/70 max-w-xl mb-12">
            Boutiques de concept, hôtels de luxe, restaurants gastronomiques — ils ont choisi KULT pour sublimer leur expérience client.
          </p>

          <div className="grid grid-cols-5 gap-4">
            {[
              { category: "Grande Distribution", name: "Monoprix", quote: "Une collection qui fait voyager nos clients dès l'entrée.", color: "border-red-500" },
              { category: "Concept Store", name: "Fleux", quote: "Des objets avec une vraie âme — exactement ce que notre clientèle cherche.", color: "border-blue-500" },
              { category: "Commerce Équitable", name: "Altermundi", quote: "L'artisanat KULT correspond parfaitement à nos valeurs.", color: "border-green-500" },
              { category: "Hôtel 5★", name: "Le Sirenuse", quote: "Nos tables ne ressemblent à aucune autre depuis KULT.", color: "border-yellow-400" },
              { category: "Restaurant", name: "Café Marly", quote: "Chaque service devient une expérience visuelle et sensorielle.", color: "border-pink-400" },
            ].map((ref) => (
              <div key={ref.name} className={`bg-white rounded-lg p-6 border-t-4 ${ref.color}`}>
                <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">{ref.category}</p>
                <h3 className="font-serif text-xl text-ink mb-4">{ref.name}</h3>
                <p className="text-ink/60 text-sm italic">"{ref.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER - réutilisé */}
      <KultNewsletter />
    </>
  )
}