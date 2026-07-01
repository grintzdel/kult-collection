"use client"

import { useState } from "react"

import type { Piece } from "./pieces"

const KultProductGallery = ({ piece }: { piece: Piece }) => {
  const [active, setActive] = useState(0)
  const images = piece.images.length > 0 ? piece.images : []
  const mainImage = images[active] ?? piece.image

  return (
    <div className="flex flex-col gap-4">
      {/* Contenant principal — arche */}
      <div
        className={`relative aspect-[5/6] overflow-hidden rounded-t-[160px] rounded-b-large shadow-soft ${
          mainImage ? "bg-cream" : piece.surface
        }`}
      >
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={piece.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            {piece.halo && (
              <div className="halo-soleil animate-kult-halo absolute inset-0 opacity-70 mix-blend-screen" />
            )}
            <div className="tex-diagonal absolute inset-0" />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-label text-ivory/80">
              {piece.caption}
            </span>
          </>
        )}
      </div>

      {/* Vignettes */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((url, i) => (
            <button
              key={url}
              type="button"
              aria-label={`Vue ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-large bg-cream transition-all ${
                active === i
                  ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory"
                  : "opacity-90 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${piece.name} — vue ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default KultProductGallery
