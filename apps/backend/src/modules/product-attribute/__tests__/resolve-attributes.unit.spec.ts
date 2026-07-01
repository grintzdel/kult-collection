import {
  AttributeDefinitionInput,
  groupAttributesByZone,
  hasAttributeValue,
  readHiddenKeys,
  resolveProductAttributes,
  withValuesOnly,
} from "../lib/resolve-attributes"

const def = (
  over: Partial<AttributeDefinitionInput> & { id: string; key: string }
): AttributeDefinitionInput => ({
  label: over.key,
  type: "text",
  zone: "accordeon",
  rank: 0,
  group_fields: null,
  ...over,
})

describe("resolveProductAttributes", () => {
  it("attaches values from metadata and sorts by rank then label", () => {
    const definitions = [
      def({ id: "1", key: "utilisation", rank: 2 }),
      def({ id: "2", key: "notes", rank: 1, zone: "accroche" }),
    ]
    const resolved = resolveProductAttributes(definitions, {
      notes: "Ambre",
      utilisation: "Laisser fondre",
    })

    expect(resolved.map((r) => r.key)).toEqual(["notes", "utilisation"])
    expect(resolved[0].value).toBe("Ambre")
  })

  it("dedupes definitions applicable via both category and product links", () => {
    const definitions = [
      def({ id: "1", key: "notes" }),
      def({ id: "1", key: "notes" }),
    ]
    expect(resolveProductAttributes(definitions, {})).toHaveLength(1)
  })

  it("excludes fields listed in metadata.attr_hidden", () => {
    const definitions = [
      def({ id: "1", key: "notes" }),
      def({ id: "2", key: "livraison_retours" }),
    ]
    const resolved = resolveProductAttributes(definitions, {
      attr_hidden: ["livraison_retours"],
    })
    expect(resolved.map((r) => r.key)).toEqual(["notes"])
  })

  it("reads a group value as an object of string subfields", () => {
    const definitions = [
      def({
        id: "1",
        key: "pyramide",
        type: "group",
        zone: "specs",
        group_fields: [
          { key: "tete", label: "Tête" },
          { key: "coeur", label: "Cœur" },
          { key: "fond", label: "Fond" },
        ],
      }),
    ]
    const resolved = resolveProductAttributes(definitions, {
      pyramide: { tete: "Bergamote", coeur: "Figue", fond: 42 },
    })
    expect(resolved[0].value).toEqual({ tete: "Bergamote", coeur: "Figue" })
  })
})

describe("hasAttributeValue / withValuesOnly", () => {
  it("treats empty and whitespace-only values as absent", () => {
    expect(hasAttributeValue({ ...def({ id: "1", key: "a" }), value: "  " })).toBe(
      false
    )
    expect(hasAttributeValue({ ...def({ id: "1", key: "a" }), value: "x" })).toBe(
      true
    )
  })

  it("keeps a group with at least one non-empty subfield", () => {
    const group = {
      ...def({ id: "1", key: "pyramide", type: "group" as const, zone: "specs" as const }),
      value: { tete: "", coeur: "Figue" },
    }
    expect(hasAttributeValue(group)).toBe(true)
    expect(withValuesOnly([group])).toHaveLength(1)
  })
})

describe("readHiddenKeys", () => {
  it("returns [] when metadata is missing or malformed", () => {
    expect(readHiddenKeys(null)).toEqual([])
    expect(readHiddenKeys({ attr_hidden: "nope" })).toEqual([])
    expect(readHiddenKeys({ attr_hidden: ["a", 1, "b"] })).toEqual(["a", "b"])
  })
})

describe("groupAttributesByZone", () => {
  it("buckets attributes into their zones preserving order", () => {
    const attrs = withValuesOnly(
      resolveProductAttributes(
        [
          def({ id: "1", key: "notes", zone: "accroche" }),
          def({ id: "2", key: "utilisation", zone: "accordeon", rank: 1 }),
          def({ id: "3", key: "details", zone: "accordeon", rank: 2 }),
        ],
        { notes: "N", utilisation: "U", details: "D" }
      )
    )
    const grouped = groupAttributesByZone(attrs)
    expect(grouped.accroche.map((a) => a.key)).toEqual(["notes"])
    expect(grouped.accordeon.map((a) => a.key)).toEqual(["utilisation", "details"])
    expect(grouped.specs).toEqual([])
  })
})
