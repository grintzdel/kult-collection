import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_ATTRIBUTE_MODULE } from "../../../modules/product-attribute"

export type GroupField = { key: string; label: string }

export type AttributeDefinitionData = {
  key: string
  label: string
  type: "text" | "textarea" | "group"
  zone: "accroche" | "specs" | "accordeon"
  rank?: number
  group_fields?: GroupField[] | null
}

// La colonne `group_fields` est un json typé `Record<string, unknown>` par le
// service généré ; on y stocke un tableau (JSON valide) via un cast localisé.
const asJson = (value: GroupField[] | null | undefined) =>
  (value ?? null) as unknown as Record<string, unknown> | null

export const createAttributeDefinitionStep = createStep(
  "create-attribute-definition",
  async (input: AttributeDefinitionData, { container }) => {
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    const created = await service.createAttributeDefinitions({
      ...input,
      group_fields: asJson(input.group_fields),
    })
    return new StepResponse(created, created.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    await service.deleteAttributeDefinitions(id)
  }
)

export type UpdateAttributeDefinitionInput = Partial<AttributeDefinitionData> & {
  id: string
}

export const updateAttributeDefinitionStep = createStep(
  "update-attribute-definition",
  async (input: UpdateAttributeDefinitionInput, { container }) => {
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    const previous = await service.retrieveAttributeDefinition(input.id)
    const { group_fields, ...rest } = input
    // N'écrase `group_fields` que s'il est fourni explicitement.
    const data =
      group_fields === undefined
        ? rest
        : { ...rest, group_fields: asJson(group_fields) }
    const updated = await service.updateAttributeDefinitions(data)
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    await service.updateAttributeDefinitions({
      id: previous.id,
      key: previous.key,
      label: previous.label,
      type: previous.type,
      zone: previous.zone,
      rank: previous.rank,
      group_fields: previous.group_fields,
    })
  }
)

export const deleteAttributeDefinitionStep = createStep(
  "delete-attribute-definition",
  async (id: string, { container }) => {
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    const previous = await service.retrieveAttributeDefinition(id)
    await service.deleteAttributeDefinitions(id)
    return new StepResponse(id, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    await service.createAttributeDefinitions({
      key: previous.key,
      label: previous.label,
      type: previous.type,
      zone: previous.zone,
      rank: previous.rank,
      group_fields: previous.group_fields,
    })
  }
)
