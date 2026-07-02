import { fetchProductAmbiance } from "../query-ambiance"

const makeQuery = (responses: Record<string, unknown[]>) => ({
  graph: async ({ entity }: { entity: string }) => ({
    data: responses[entity] ?? [],
  }),
})

describe("fetchProductAmbiance", () => {
  it("returns the product override when the product has a tag", async () => {
    const query = makeQuery({
      product: [
        {
          id: "p1",
          tags: [{ id: "t1", value: "cozy" }],
          categories: [{ metadata: { ambiance_tag_id: "t2" } }],
        },
      ],
      product_tag: [{ id: "t2", value: "california" }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toEqual({
      id: "t1",
      value: "cozy",
    })
  })

  it("hydrates the inherited category ambiance when the product has no tag", async () => {
    const query = makeQuery({
      product: [
        {
          id: "p1",
          tags: [],
          categories: [{ metadata: { ambiance_tag_id: "t2" } }],
        },
      ],
      product_tag: [{ id: "t2", value: "california" }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toEqual({
      id: "t2",
      value: "california",
    })
  })

  it("returns null when neither product nor category defines an ambiance", async () => {
    const query = makeQuery({
      product: [{ id: "p1", tags: [], categories: [{ metadata: {} }] }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toBeNull()
  })

  it("returns null when the product does not exist", async () => {
    const query = makeQuery({ product: [] })
    expect(await fetchProductAmbiance(query, "nope")).toBeNull()
  })
})
