type KultNewsletterProps = {
  eyebrow?: string
  title?: string
}

const KultNewsletter = ({
  eyebrow = "Rejoindre la maison",
  title = "Une lettre, de temps en temps. Jamais de bruit.",
}: KultNewsletterProps) => {
  return (
    <section className="bg-ink text-ivory">
      <div className="kult-container py-20 text-center small:py-24">
        <span data-reveal className="eyebrow text-ivory/50">{eyebrow}</span>
        <h2 data-split className="display mx-auto mt-5 max-w-2xl text-3xl text-ivory small:text-4xl">
          {title}
        </h2>
        <form data-reveal className="mx-auto mt-9 flex max-w-md items-center gap-2 rounded-circle border border-ivory/20 bg-ivory/5 p-1.5 pl-5">
          <input
            type="email"
            placeholder="votre@email.fr"
            className="flex-1 bg-transparent font-mono text-[12px] text-ivory placeholder:text-ivory/40 focus:outline-none"
          />
          <button type="submit" className="btn-soleil btn-sm">
            S'inscrire
          </button>
        </form>
      </div>
    </section>
  )
}

export default KultNewsletter
