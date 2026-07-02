export const AMBIANCES_QUERY_KEY = ["ambiances"] as const

export type Ambiance = {
  id: string
  value: string
  color: string | null
  product_count: number
  category_count: number
}

export type AmbianceCategory = {
  id: string
  name: string
  metadata?: Record<string, unknown> | null
}
