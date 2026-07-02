const KultNewsletter = () => {
  return (
    <footer className="bg-[#fdf6ee]">
      {/* Séparateur image en haut */}
      <img
        src="/kult/sep2.png"
        alt="separateur"
        className="w-full"
      />

      <div className="max-w-6xl mx-auto px-10 py-16 grid grid-cols-4 gap-10">
        {/* Colonne 1 - Logo + description */}
        <div>
          <h3 className="font-serif text-2xl text-ink mb-4">KULT</h3>
          <p className="text-ink/60 text-sm leading-relaxed mb-4">
            Objets artisanaux inspirés des vacances et du voyage. Faits à la main, pour les belles tables.
          </p>
          <div className="flex items-center gap-2 text-ink/90 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.5} />
              <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
            <span>@kultcollection</span>
          </div>
        </div>

        {/* Colonne 2 - Explorer */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink mb-6">Explorer</h4>
          <ul className="flex flex-col gap-3 text-ink/60 text-sm">
            <li><a href="/collections">Collections</a></li>
            <li><a href="/atelier">Notre Atelier</a></li>
            <li><a href="/boutiques">Nos Boutiques</a></li>
          </ul>
        </div>

        {/* Colonne 3 - Collections */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink mb-6">Collections</h4>
          <ul className="flex flex-col gap-3 text-ink/60 text-sm">
            <li><a href="#">Dolce Vita</a></li>
            <li><a href="#">Riviera</a></li>
            <li><a href="#">Hotel</a></li>
            <li><a href="#">California</a></li>
          </ul>
        </div>

        {/* Colonne 4 - Newsletter */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink mb-4">Newsletter</h4>
          <p className="text-ink/60 text-sm mb-4">
            Les nouvelles collections, les événements, les histoires.
          </p>
          <div className="flex items-center border-b border-ink/20 pb-2">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <button type="button" className="text-ink">
              &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bas du footer */}
      <div className="border-t border-ink/10 px-10 py-6 max-w-6xl mx-auto flex justify-between text-xs text-ink/40">
        <span>© 2025 KULT Collection — Tous droits réservés</span>
        <div className="flex gap-6">
          <a href="#">Mentions légales</a>
          <a href="#">Confidentialité</a>
          <a href="#">CGV</a>
        </div>
      </div>
    </footer>
  )
}

export default KultNewsletter