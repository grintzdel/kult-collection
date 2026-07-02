import type { Piece } from "./pieces"

const KultCollection = ({ pieces }: { pieces: Piece[] }) => {
  return (
    <section className="bg-[#fdf6ee] py-24">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex gap-16">
          {/* Colonne gauche - texte sticky */}
          <div className="w-1/3 sticky top-32 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <span className="block w-6 h-0.5 bg-blue-500"></span>
              <span className="text-blue-500 text-xs uppercase tracking-widest">Collections</span>
            </div>
            <h2 className="font-serif text-4xl text-ink mb-4">
              Des images, des objets, des odeurs
            </h2>
            <div className="w-8 h-0.5 bg-ink mb-6"></div>
            <p className="text-ink/70 leading-relaxed mb-6">
              Assiettes peintes à la main, bougies artisanales, sets de table —
              tout pour sublimer votre table et vos intérieurs. Retrouvez des textures, des senteurs et des petits bouts d'ailleurs dans nos collections. Et parce que chaque intérieur raconte une histoire unique, personnalisez nos créations pour leur donner une touche qui vous ressemble.
            </p>
            <a href="/collections" className="text-blue-500 text-sm uppercase tracking-widest underline underline-offset-4">
              Voir la collection →
            </a>
          </div>

          {/* Colonne droite - grille d'images */}
          <div className="w-2/3 flex flex-col gap-4">
            {/* Grande image en haut */}
            <div className="w-full">
              <img
                src="/kult/imgd1.png"
                alt="Collection 1"
                className="w-full h-auto object-cover rounded"
              />
            </div>

            {/* Deux petites images en bas */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="/kult/imgd2.png"
                alt="Collection 2"
                className="w-full h-auto object-cover rounded"
              />
              <img
                src="/kult/imgd3.png"
                alt="Collection 3"
                className="w-full h-auto object-cover rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default KultCollection