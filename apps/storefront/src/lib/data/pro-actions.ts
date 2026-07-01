"use server"

import { sdk } from "@lib/config"

export type SubmitProLeadInput = {
  company: string
  email: string
  vat_or_siret?: string
  message?: string
}

export type SubmitProLeadResult = { ok: boolean; error?: string }

/**
 * Enregistre une demande d'accès pro depuis la landing /pro.
 */
export async function submitProLead(
  input: SubmitProLeadInput
): Promise<SubmitProLeadResult> {
  try {
    await sdk.client.fetch("/store/pro/leads", {
      method: "POST",
      body: input,
    })
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue, réessayez.",
    }
  }
}
