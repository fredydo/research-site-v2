'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Lang } from './translations'

type LangContextType = {
  lang: Lang
  t: typeof translations.es
  toggleLang: () => void
}

const LangContext = createContext<LangContextType>({
  lang:       'es',
  t:          translations.es,
  toggleLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gita-lang') as Lang | null
    if (saved && translations[saved]) setLang(saved)
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'es' ? 'en' : 'es'
    setLang(next)
    localStorage.setItem('gita-lang', next)
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
