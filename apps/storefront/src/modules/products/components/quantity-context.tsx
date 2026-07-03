"use client"

import { createContext, useContext, useState } from "react"

type QuantityContextValue = {
  qty: number
  setQty: (updater: number | ((prev: number) => number)) => void
}

const QuantityContext = createContext<QuantityContextValue>({
  qty: 1,
  setQty: () => {},
})

/**
 * Partage l'état « quantité » entre l'affichage du prix (haut de la fiche) et le
 * stepper + CTA d'ajout au panier (bas de la fiche), qui vivent dans deux
 * composants distincts de {@link ProductInfo}.
 */
export const QuantityProvider = ({ children }: { children: React.ReactNode }) => {
  const [qty, setQty] = useState(1)
  return (
    <QuantityContext.Provider value={{ qty, setQty }}>
      {children}
    </QuantityContext.Provider>
  )
}

export const useQuantity = (): QuantityContextValue => useContext(QuantityContext)
