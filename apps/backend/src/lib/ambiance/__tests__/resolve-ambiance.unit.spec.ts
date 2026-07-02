import { AmbianceTag, resolveProductAmbiance } from "../resolve-ambiance"

const tag = (id: string, value: string, color: string | null = null): AmbianceTag => ({
  id,
  value,
  color,
})

describe("resolveProductAmbiance", () => {
  it("returns the product's own tag (override) when present, keeping its color", () => {
    expect(
      resolveProductAmbiance(
        [tag("t1", "cozy", "#FFCA42")],
        tag("t2", "california", "#FCA4E0")
      )
    ).toEqual({ id: "t1", value: "cozy", color: "#FFCA42" })
  })

  it("falls back to the category ambiance when the product has no tag", () => {
    expect(resolveProductAmbiance([], tag("t2", "california", "#FCA4E0"))).toEqual({
      id: "t2",
      value: "california",
      color: "#FCA4E0",
    })
  })

  it("falls back to the category ambiance when tags is null", () => {
    expect(resolveProductAmbiance(null, tag("t2", "california"))).toEqual({
      id: "t2",
      value: "california",
      color: null,
    })
  })

  it("returns null when there is neither an override nor a category ambiance", () => {
    expect(resolveProductAmbiance(null, null)).toBeNull()
    expect(resolveProductAmbiance([], undefined)).toBeNull()
  })
})
