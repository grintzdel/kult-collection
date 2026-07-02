"use client"

import Image from "next/image"
import { useState } from "react"

type ProductGalleryProps = {
  images: string[]
  alt: string
}

/**
 * Galerie fiche produit : image sélectionnée (grande) + rangée de miniatures
 * (petits carrés alignés à gauche, bordure fine — cf. maquette).
 */
const ProductGallery = ({ images, alt }: ProductGalleryProps) => {
  const [active, setActive] = useState(0)
  const gallery = images.length > 0 ? images : []
  const main = gallery[active]

  return (
    // Div 1 (images) — flex-col gap 22px, 50% de la largeur
    <div className="flex w-full flex-col gap-[22px] small:w-1/2">
      {/* Image produit sélectionnée — remplit la hauteur libre (desktop) pour
          que le bas des miniatures s'aligne sur le bas de la carte infos */}
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-cream small:aspect-auto small:min-h-0 small:flex-1">
        {main && (
          <Image
            src={main}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Miniatures (toutes les images) — flex-row gap 22px, boîtes égales
          qui remplissent la largeur, image contenue et centrée, bordure
          marquée sur l'active */}
      {gallery.length > 1 && (
        <div className="flex flex-row gap-[22px]">
          {gallery.map((url, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Vue ${i + 1}`}
              aria-current={active === i}
              onClick={() => setActive(i)}
              className={`relative aspect-square flex-1 basis-0 overflow-hidden rounded-sm bg-cream p-6 transition-opacity ${
                active === i
                  ? "border border-[#242121]"
                  : "border border-[#242121]/15 hover:opacity-80"
              }`}
            >
              <span className="relative block h-full w-full">
                <Image
                  src={url}
                  alt={`${alt} — vue ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 30vw, 15vw"
                  className="object-contain"
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
