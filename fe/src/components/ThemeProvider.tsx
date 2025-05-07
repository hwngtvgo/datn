"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Tách các hằng số ra file riêng để tránh cảnh báo fast refresh
export const THEME_CONFIG = {
  initialState: {
    theme: "system" as Theme,
    setTheme: () => null,
  },
  defaultStorageKey: "vite-ui-theme",
} as const

const ThemeProviderContext = createContext<ThemeProviderState>(THEME_CONFIG.initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_CONFIG.defaultStorageKey,
  ...props
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (currentTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(currentTheme)
  }, [currentTheme])

  const value = {
    theme: currentTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setCurrentTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
