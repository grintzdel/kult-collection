/**
 * Découpe une liste en lignes selon un pattern de tailles de ligne.
 * Ex. pattern [1, 4, 3] : ligne 1 = 1 élément, ligne 2 = 4, ligne 3 = 3,
 * puis on reboucle si `repeat` (défaut true).
 *
 * C'est le cœur du layout variable de la page Collection (maquette : 1 / 4 / 3).
 * Fonction pure, testable.
 */
export type LayoutPattern = {
  pattern: number[]
  repeat: boolean
}

export const DEFAULT_PATTERN: LayoutPattern = {
  pattern: [1, 4, 3],
  repeat: true,
}

export const chunkByPattern = <T>(
  items: T[],
  layout: LayoutPattern = DEFAULT_PATTERN
): T[][] => {
  const sizes = layout.pattern.filter((n) => Number.isFinite(n) && n > 0)
  if (sizes.length === 0 || items.length === 0) {
    return items.length ? [items] : []
  }

  const rows: T[][] = []
  let cursor = 0
  let patternIndex = 0

  while (cursor < items.length) {
    const size = sizes[patternIndex]
    rows.push(items.slice(cursor, cursor + size))
    cursor += size
    patternIndex += 1

    if (patternIndex >= sizes.length) {
      if (!layout.repeat) {
        // Plus de pattern : on met tout le reste sur une dernière ligne.
        if (cursor < items.length) {
          rows.push(items.slice(cursor))
        }
        break
      }
      patternIndex = 0
    }
  }

  return rows
}
