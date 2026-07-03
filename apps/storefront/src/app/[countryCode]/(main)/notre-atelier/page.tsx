import { Metadata } from "next"
import KultNewsletter from "@modules/home/components/kult/newsletter"

export const metadata: Metadata = {
  title: "Notre Atelier — KULT",
  description: "Découvrez l'univers artisanal de KULT.",
}

export default function NotreAtelierPage() {
  return (
    <>
      {/* HERO - image avec auvent + arches superposées */}
      <section className="relative w-full overflow-hidden">
  {/* Image de fond */}
  <img
    src="/kult/imgy1.png"
    alt="Notre Atelier"
    className="absolute top-0 left-0 w-full h-full object-bottom"
  />

  {/* 2 images en arche flottantes */}
  <div className="relative w-full h-[600px]">
    <div className="absolute left-80 top-28 rounded-t-full overflow-hidden border-4 border-green-700 w-80 h-[450px]">
      <img src="/kult/imgy2.png" alt="Atelier 1" className="w-full h-full object-cover" />
    </div>
    <div className="absolute right-80 top-28 rounded-t-full overflow-hidden border-4 border-green-700 w-80 h-[450px]">
      <img src="/kult/imgy3.png" alt="Atelier 2" className="w-full h-full object-cover" />
    </div>
  </div>
</section>

      {/* L'art de vivre ailleurs */}
      <section className="bg-[#fdf6ee] py-24">
        <div className="max-w-6xl mx-auto px-10 grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="block w-6 h-0.5 bg-blue-500"></span>
              <span className="text-blue-500 text-xs uppercase tracking-widest">Parlons-nous</span>
            </div>
            <h2 className="font-serif text-5xl text-ink mb-8">
              L'art de vivre ailleurs
            </h2>
            <p className="text-ink/70 leading-relaxed mb-6">
              Depuis 2018, Kult est une maison d'artisanat contemporain où bougies parfumées et objets en céramiques deviennent des objets d'émotion. Nous célébrons le fait-main, la matière et les couleurs.
            </p>
            <p className="text-ink/70 leading-relaxed mb-6">
              Nos parfums sont sélectionnés à Grasse, nos bougies coulées à la main dans notre atelier parisien, et nos contenants en céramique sont imaginés par nos soins puis tournés et peints à la main par des artisans en Andalousie.
            </p>
            <p className="text-ink/70 leading-relaxed">
              Chaque pièce est pensée comme un objet de décoration autant qu'un objet de sens, mêlant savoir-faire, douceur et authenticité.
            </p>
          </div>

          <div className="relative">
            <img src="/kult/sticker3.png" alt="Kult tampon" className="absolute -top-8 right-8 z-10 w-24" />
            <img
              src="/kult/imgd1.png"
              alt="L'art de vivre ailleurs"
              className="w-full h-[600px] object-cover rounded-lg rotate-2 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Collect memories, not objects */}
      <section className="bg-[#fdf6ee] py-24 border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-blue-500"></span>
            <span className="text-blue-500 text-xs uppercase tracking-widest">Nos valeurs</span>
          </div>
          <h2 className="font-serif text-5xl text-ink mb-16">
            Collect memories, not objects
          </h2>

          <div className="grid grid-cols-3 gap-8">
            {[
              {
                image: "/kult/imgy5.png",
                title: "Authenticité",
                subtitle: "L'AUTHENTICITÉ AVANT TOUT",
                description: "Chez KULT, nous croyons aux objets qui ont une âme. Chaque création est imaginée avec simplicité, façonnée à la main et pensée pour durer. Les petites irrégularités font partie de leur histoire et rendent chaque pièce véritablement unique.",
              },
              {
                image: "/kult/imgy6.png",
                title: "Artisanat",
                subtitle: "L'ARTISANAT COMME SIGNATURE",
                description: "Nos collections prennent vie dans des ateliers où le geste artisanal est au cœur de chaque étape. De la peinture réalisée à la main aux finitions délicates, chaque objet reflète un savoir-faire précieux qui transforme le quotidien en quelque chose d'exceptionnel.",
              },
              {
                image: "/kult/imgy7.png",
                title: "Émotion & Souvenirs",
                subtitle: "DES OBJETS QUI RACONTENT DES SOUVENIRS",
                description: "Une table dressée entre amis, un café au soleil, une bougie allumée en fin de journée... KULT imagine des objets qui accompagnent ces instants simples. Plus que de la décoration, ce sont des souvenirs en devenir, des pièces qui invitent à ralentir et à partager.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-lg overflow-hidden border border-ink/10">
                <img src={item.image} alt={item.title} className="w-full h-72 object-cover" />
                <div className="p-6">
                  <h3 className="font-serif text-xl text-ink mb-1">{item.title}</h3>
                  <p className="text-xs uppercase tracking-widest text-ink/40 mb-4">{item.subtitle}</p>
                  <p className="text-ink/60 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toujours plus kult */}
      <section className="bg-[#fdf6ee] py-24 border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-blue-500"></span>
            <span className="text-blue-500 text-xs uppercase tracking-widest">Nos valeurs</span>
          </div>
          <h2 className="font-serif text-5xl text-ink mb-16">
            Toujours plus kult
          </h2>

          <div className="grid grid-cols-6 mb-10 border border-black">
            {[
              { name: "Assiettes", price: "14€ - 55€", image: "/kult/imgy12.png" },
              { name: "Carafes", price: "34€", image: "/kult/4b7690_f40b1848d2b5413cbe845aa1623bf659~mv2.png.png" },
              { name: "Mugs", price: "29€", image: "/kult/imgy10.png" },
              { name: "Coupelle à graines", price: "25€", image: "/kult/imgy21.png" },
              { name: "Bougies", price: "26€", image: "/kult/imgy11.png" },
              { name: "Petites assiettes La bella vita", price: "34€", image: "/kult/imgy14.png" },
            ].map((product, index, arr) => (
              <div
                key={product.name}
                className={`text-center p-4 ${index < arr.length - 1 ? "border-r border-black" : ""}`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-24 object-contain mb-2"
                />
                <p className="text-xs text-ink/70">{product.name}</p>
                <p className="text-xs text-ink/40">{product.price}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <a href="/collections" className="inline-flex items-center gap-2 rounded-full bg-green-700 px-8 py-3 text-sm uppercase tracking-widest text-white">
              Découvrir nos collections →
            </a>
          </div>
        </div>
      </section>

      <KultNewsletter />
    </>
  )
}