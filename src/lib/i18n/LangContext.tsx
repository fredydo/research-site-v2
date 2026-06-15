'use client'
import { createContext, useContext, ReactNode } from 'react'
import { translations } from './translations'

type LangContextType = {
  t: typeof translations.en
}

const LangContext = createContext<LangContextType>({
  t: translations.en,
})

export function LangProvider({ children }: { children: ReactNode }) {
  return (
    <LangContext.Provider value={{ t: translations.en }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
