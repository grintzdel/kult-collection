import { AmbianceTag, resolveProductAmbiance } from "../resolve-ambiance"

const tag = (id: string, value: string): AmbianceTag => ({ id, value })

describe("resolveProductAmbiance", () => {
  it("returns the product's own tag (override) when present", () => {
    expect(
      resolveProductAmbiance([tag("t1", "cozy")], tag("t2", "california"))
    ).toEqual({ id: "t1", value: "cozy" })
  })

  it("falls back to the category ambiance when the product has no tag", () => {
    expect(resolveProductAmbiance([], tag("t2", "california"))).toEqual({
      id: "t2",
      value: "california",
    })
  })

  it("falls back to the category ambiance when tags is null", () => {
    expect(resolveProductAmbiance(null, tag("t2", "california"))).toEqual({
      id: "t2",
      value: "california",
    })
  })

  it("returns null when there is neither an override nor a category ambiance", () => {
    expect(resolveProductAmbiance(null, null)).toBeNull()
    expect(resolveProductAmbiance([], undefined)).toBeNull()
  })
})
