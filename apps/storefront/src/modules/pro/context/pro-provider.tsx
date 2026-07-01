"use client"

import { createContext, useContext } from "react"
import { DEFAULT_PRO_CONTEXT, type ProContextValue } from "../types"

const ProContext = createContext<ProContextValue>(DEFAULT_PRO_CONTEXT)

export const ProProvider = ({
  value,
  children,
}: {
  value: ProContextValue
  children: React.ReactNode
}) => {
  return <ProContext.Provider value={value}>{children}</ProContext.Provider>
}

export const usePro = (): ProContextValue => useContext(ProContext)
