"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { usePathname } from "next/navigation"

import { HttpTypes } from "@medusajs/types"
import {
  addToCart,
  deleteLineItem,
  retrieveCart,
  updateLineItem,
} from "@lib/data/cart"
import { formatPrice } from "./pieces"

export const FREE_SHIPPING_THRESHOLD = 80
export const SHIPPING_FLAT = 6

/** Objet « pièce » léger reconstruit depuis une ligne de panier Medusa. */
export type CartLinePiece = {
  handle: string
  name: string
  image: string | null
  surface: string
  price: string
  scent: string
  notes: string
}

export type CartLine = {
  lineId: string
  variantId: string | null
  piece: CartLinePiece
  qty: number
  lineTotal: number
}

type CartContextValue = {
  lines: CartLine[]
  giftWrap: boolean
  isOpen: boolean
  isMutating: boolean
  lastAdded: string | null
  count: number
  subtotal: number
  shipping: number
  total: number
  remaining: number
  freeShipping: boolean
  currencyCode: string
  addItem: (variantId: string, qty?: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  setQty: (lineId: string, qty: number) => Promise<void>
  toggleGiftWrap: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart doit être utilisé dans un <CartProvider>")
  }
  return ctx
}

const DEFAULT_COUNTRY =
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"

const toLine = (item: HttpTypes.StoreCartLineItem): CartLine => {
  const unitPrice = item.unit_price ?? 0
  const qty = item.quantity ?? 1
  return {
    lineId: item.id,
    variantId: item.variant_id ?? null,
    qty,
    lineTotal: item.total ?? unitPrice * qty,
    piece: {
      handle: item.product_handle ?? "",
      name: item.product_title ?? item.title ?? "Pièce",
      image: item.thumbnail ?? null,
      surface: "bg-cream",
      price: formatPrice(unitPrice, item.cart?.currency_code ?? "eur"),
      scent: item.variant_title
        ? `${item.variant_title} · Cire de soja`
        : "Cire de soja",
      notes: "Fait main",
    },
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [giftWrap, setGiftWrap] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  // Pays courant déduit de l'URL (/<countryCode>/...) — sinon région par défaut.
  const countryCode = useMemo(() => {
    const segment = pathname?.split("/").filter(Boolean)[0]
    return segment && segment.length === 2 ? segment : DEFAULT_COUNTRY
  }, [pathname])

  // Chargement initial du panier Medusa (depuis le cookie de session).
  useEffect(() => {
    let mounted = true
    retrieveCart()
      .then((c) => {
        if (mounted) setCart(c)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  // Verrou du scroll quand le drawer est ouvert.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const refresh = useCallback(async () => {
    const fresh = await retrieveCart()
    setCart(fresh)
    return fresh
  }, [])

  const addItem = useCallback(
    async (variantId: string, qty = 1) => {
      if (!variantId) return
      setIsMutating(true)
      try {
        await addToCart({ variantId, quantity: qty, countryCode })
        const fresh = await refresh()
        const line = fresh?.items?.find((i) => i.variant_id === variantId)
        setLastAdded(line?.id ?? null)
        setIsOpen(true)
      } finally {
        setIsMutating(false)
      }
    },
    [countryCode, refresh]
  )

  const removeItem = useCallback(
    async (lineId: string) => {
      setIsMutating(true)
      try {
        await deleteLineItem(lineId)
        await refresh()
      } finally {
        setIsMutating(false)
      }
    },
    [refresh]
  )

  const setQty = useCallback(
    async (lineId: string, qty: number) => {
      setIsMutating(true)
      try {
        if (qty <= 0) {
          await deleteLineItem(lineId)
        } else {
          await updateLineItem({ lineId, quantity: qty })
        }
        await refresh()
      } finally {
        setIsMutating(false)
      }
    },
    [refresh]
  )

  const value = useMemo<CartContextValue>(() => {
    const items = cart?.items ?? []
    const lines = items
      .slice()
      .sort((a, b) =>
        String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""))
      )
      .map(toLine)

    const currencyCode = cart?.currency_code ?? "eur"
    const count = lines.reduce((sum, l) => sum + l.qty, 0)
    const subtotal =
      cart?.item_subtotal ??
      lines.reduce((sum, l) => sum + l.lineTotal, 0)
    const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
    const shipping = subtotal === 0 ? 0 : freeShipping ? 0 : SHIPPING_FLAT
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
    const total = subtotal + shipping

    return {
      lines,
      giftWrap,
      isOpen,
      isMutating,
      lastAdded,
      count,
      subtotal,
      shipping,
      total,
      remaining,
      freeShipping,
      currencyCode,
      addItem,
      removeItem,
      setQty,
      toggleGiftWrap: () => setGiftWrap((g) => !g),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }
  }, [
    cart,
    giftWrap,
    isOpen,
    isMutating,
    lastAdded,
    addItem,
    removeItem,
    setQty,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
