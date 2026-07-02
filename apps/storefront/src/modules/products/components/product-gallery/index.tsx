"use client"

import Image from "next/image"
import { useState } from "react"

type ProductGalleryProps = {
  images: string[]
  alt: string
}

/**
 * Galerie fiche produit : image sélectionnée (grande) + rangée de miniatures.
 * La miniature active porte une bordure pleine #242121 (cf. maquette).
 */
const ProductGallery = ({ images, alt }: ProductGalleryProps) => {
  const [active, setActive] = useState(0)
  const gallery = images.length > 0 ? images : []
  const main = gallery[active]

  return (
    // Div 1 (images) — flex-col gap 48.5px
    <div className="flex w-full flex-col gap-[48.5px]">
      {/* Image produit sélectionnée */}
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-cream">
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

      {/* Miniatures — flex-row gap 22px, bordure #242121 sur l'active */}
      {gallery.length > 1 && (
        <div className="flex flex-row gap-[22px]">
          {gallery.map((url, i) => (
            <button
              key={url}
              type="button"
              aria-label={`Vue ${i + 1}`}
              aria-current={active === i}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-[92px] shrink-0 overflow-hidden rounded-sm bg-cream transition-opacity ${
                active === i
                  ? "border border-[#242121]"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={url}
                alt={`${alt} — vue ${i + 1}`}
                fill
                sizes="92px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
