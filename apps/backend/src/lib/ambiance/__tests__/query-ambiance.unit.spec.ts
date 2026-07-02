import { fetchProductAmbiance, fetchProductsAmbiances } from "../query-ambiance"

const makeQuery = (responses: Record<string, unknown[]>) => ({
  graph: async ({ entity }: { entity: string }) => ({
    data: responses[entity] ?? [],
  }),
})

describe("fetchProductAmbiance", () => {
  it("returns the product override (with its color) when the product has a tag", async () => {
    const query = makeQuery({
      product: [
        {
          id: "p1",
          tags: [{ id: "t1", value: "cozy", metadata: { color: "#FFCA42" } }],
          categories: [{ metadata: { ambiance_tag_id: "t2" } }],
        },
      ],
      product_tag: [{ id: "t2", value: "california", metadata: { color: "#FCA4E0" } }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toEqual({
      id: "t1",
      value: "cozy",
      color: "#FFCA42",
    })
  })

  it("hydrates the inherited category ambiance (with its color) when the product has no tag", async () => {
    const query = makeQuery({
      product: [
        {
          id: "p1",
          tags: [],
          categories: [{ metadata: { ambiance_tag_id: "t2" } }],
        },
      ],
      product_tag: [{ id: "t2", value: "california", metadata: { color: "#FCA4E0" } }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toEqual({
      id: "t2",
      value: "california",
      color: "#FCA4E0",
    })
  })

  it("returns a null color when the tag has no color metadata", async () => {
    const query = makeQuery({
      product: [{ id: "p1", tags: [{ id: "t1", value: "cozy" }], categories: [] }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toEqual({
      id: "t1",
      value: "cozy",
      color: null,
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

describe("fetchProductsAmbiances", () => {
  it("resolves overrides and inherited ambiances for a batch, in two graph queries", async () => {
    const calls: string[] = []
    const query = {
      graph: async ({ entity }: { entity: string }) => {
        calls.push(entity)
        if (entity === "product") {
          return {
            data: [
              {
                id: "p1",
                tags: [{ id: "t1", value: "cozy", metadata: { color: "#FFCA42" } }],
                categories: [{ metadata: { ambiance_tag_id: "t2" } }],
              },
              {
                id: "p2",
                tags: [],
                categories: [{ metadata: { ambiance_tag_id: "t2" } }],
              },
              {
                id: "p3",
                tags: [],
                categories: [{ metadata: {} }],
              },
            ],
          }
        }
        return {
          data: [{ id: "t2", value: "california", metadata: { color: "#FCA4E0" } }],
        }
      },
    }

    const result = await fetchProductsAmbiances(query, ["p1", "p2", "p3"])

    expect(result).toEqual({
      p1: { id: "t1", value: "cozy", color: "#FFCA42" },
      p2: { id: "t2", value: "california", color: "#FCA4E0" },
      p3: null,
    })
    // one query for products, one to hydrate inherited tags
    expect(calls).toEqual(["product", "product_tag"])
  })

  it("skips the tag hydration query when no ambiance is inherited", async () => {
    const calls: string[] = []
    const query = {
      graph: async ({ entity }: { entity: string }) => {
        calls.push(entity)
        return {
          data: [
            {
              id: "p1",
              tags: [{ id: "t1", value: "cozy", metadata: { color: "#FFCA42" } }],
              categories: [],
            },
          ],
        }
      },
    }

    const result = await fetchProductsAmbiances(query, ["p1"])

    expect(result).toEqual({ p1: { id: "t1", value: "cozy", color: "#FFCA42" } })
    expect(calls).toEqual(["product"])
  })

  it("returns an empty map for an empty id list without querying", async () => {
    const calls: string[] = []
    const query = {
      graph: async ({ entity }: { entity: string }) => {
        calls.push(entity)
        return { data: [] }
      },
    }

    expect(await fetchProductsAmbiances(query, [])).toEqual({})
    expect(calls).toEqual([])
  })
})
