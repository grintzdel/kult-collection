export type ProConfig = {
  active: boolean
  online_purchase_enabled: boolean
  min_order_amount: number
  currency_code: string
  display_ht: boolean
}

export type ProContextValue = {
  isPro: boolean
  config: ProConfig
  /** taux de TVA (%) du pays courant, pour l'affichage TTC. 0 si non configuré. */
  vatRate: number
}

export const DEFAULT_PRO_CONFIG: ProConfig = {
  active: false,
  online_purchase_enabled: false,
  min_order_amount: 0,
  currency_code: "eur",
  display_ht: true,
}

export const DEFAULT_PRO_CONTEXT: ProContextValue = {
  isPro: false,
  config: DEFAULT_PRO_CONFIG,
  vatRate: 0,
}
