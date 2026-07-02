const KultManifeste = () => {
  return (
    <section className="bg-[#fdf6ee] py-24">
      <div className="max-w-6xl mx-auto px-10 ml-24 grid grid-cols-2 gap-16 items-center">
        {/* Colonne gauche - texte */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-blue-500"></span>
            <span className="text-blue-500 text-xs uppercase tracking-widest">Notre Manifeste</span>
          </div>

          <h2 className="font-serif text-5xl text-ink mb-8">
            Habiter ses souvenirs
          </h2>

          <p className="text-ink/70 leading-relaxed mb-6">
            KULT invite à transformer chaque intérieur en carnet de bord vivant,
            où les objets deviennent les témoins d'escales, de rencontres et
            d'horizons lointains. Inspirées par les embruns, les ports baignés
            de soleil et la douceur des bords de mer, nos créations racontent
            des histoires de voyage et insufflent un esprit d'évasion au
            quotidien. Plus que de la décoration, chaque pièce transporte un
            souvenir et prolonge le goût de l'aventure jusque chez soi.
          </p>

          <p className="text-ink/70 leading-relaxed">
            Chaque pièce est pensée comme un souvenir rapporté d'ailleurs : un
            fragment de paysage, une émotion capturée, une atmosphère que l'on
            choisit de faire voyager jusque chez soi. Plus que de simples objets
            de décoration, nos créations invitent à oser, à explorer et à
            prolonger l'aventure bien après le retour.
          </p>
        </div>

        {/* Colonne droite - photo + stickers */}
        <div className="relative flex gap-4">
          {/* Trait bleu vertical */}
          <img
  src="/kult/barre.png"
  alt="barre"
  className="h-full object-cover mt-20 ml-8"
/>

          <div className="relative flex-1">
            {/* Sticker tampon rond */}
            {/* Sticker Group 54 - haut gauche de la vidéo */}
<img
  src="/kult/Group 54.png"
  alt="Kult timbre"
  className="absolute top-0 right-44 z-10 w-44"
/>

{/* Sticker tamp1 - bas droite de la vidéo */}
<img
  src="/kult/tamp 1.png"
  alt="Kult tampon"
  className="absolute -bottom-8 -right-44 z-10 w-36"
/>

               {/* Vidéo principale inclinée */}
<div className="relative rotate-2 shadow-xl w-full ml-36 mt-12">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="w-full object-cover rounded -bottom-10"
  >
    <source src="/kult/vid1.mp4" type="video/mp4" />
  </video>
</div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default KultManifeste