// Planora – Tema yönetimi (çoklu renk teması + light/dark mod)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type ThemeColor = 'romantic' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'cherry' | 'apple' | 'minimal'
export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
  bg: string
  fg: string
  primary: string
  secondary: string
  accent: string
  card: string
  muted: string
  mutedFg: string
  navBg: string
  gradient: [string, string]
  destructive: string
  softLight: string
}

export interface ThemeOption {
  label: string
  emoji: string
  light: ThemeColors
  dark: ThemeColors
}

// Hex → rgba yardımcı fonksiyon
export function hexToRgba(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export const themes: Record<ThemeColor, ThemeOption> = {
  romantic: {
    label: 'Romantik',
    emoji: '💕',
    light: {
      bg: '#FDF6F0', fg: '#3D2C3E', primary: '#B8A0DC', secondary: '#FADADD',
      accent: '#E8DFF5', card: '#FFFFFF', muted: '#F0EAFA', mutedFg: '#8A7B8E',
      navBg: 'rgba(253,246,240,0.85)', gradient: ['#FADADD', '#E8DFF5'],
      destructive: '#E8808C', softLight: '#B8A9BC',
    },
    dark: {
      bg: '#1A1225', fg: '#E8DFF5', primary: '#C4B0E8', secondary: '#3D2A3E',
      accent: '#2D1F3E', card: '#231A30', muted: '#2D1F3E', mutedFg: '#A090AD',
      navBg: 'rgba(26,18,37,0.92)', gradient: ['#C4B0E8', '#E8808C'],
      destructive: '#E8808C', softLight: '#6A5A70',
    },
  },
  ocean: {
    label: 'Okyanus',
    emoji: '🌊',
    light: {
      bg: '#F0F7FA', fg: '#1A3A4A', primary: '#4A9FCA', secondary: '#B8E0F0',
      accent: '#DEF0F8', card: '#FFFFFF', muted: '#E0F0F8', mutedFg: '#5A8090',
      navBg: 'rgba(240,247,250,0.85)', gradient: ['#B8E0F0', '#4A9FCA'],
      destructive: '#E87070', softLight: '#88AAB8',
    },
    dark: {
      bg: '#0D1B2A', fg: '#B8E0F0', primary: '#5AAFDA', secondary: '#1A3040',
      accent: '#152535', card: '#132030', muted: '#1A3040', mutedFg: '#7AABB8',
      navBg: 'rgba(13,27,42,0.92)', gradient: ['#5AAFDA', '#3D8BB8'],
      destructive: '#E87070', softLight: '#405A68',
    },
  },
  forest: {
    label: 'Orman',
    emoji: '🌿',
    light: {
      bg: '#F2F8F0', fg: '#2A3E2E', primary: '#6AAF7A', secondary: '#C8E6C0',
      accent: '#D8EED2', card: '#FFFFFF', muted: '#E2F0DC', mutedFg: '#6A8A70',
      navBg: 'rgba(242,248,240,0.85)', gradient: ['#C8E6C0', '#6AAF7A'],
      destructive: '#E87070', softLight: '#90AA94',
    },
    dark: {
      bg: '#121E14', fg: '#C8E6C0', primary: '#7ABF8A', secondary: '#1A3020',
      accent: '#1A2A1C', card: '#182818', muted: '#1A3020', mutedFg: '#8AB890',
      navBg: 'rgba(18,30,20,0.92)', gradient: ['#7ABF8A', '#4A8F5A'],
      destructive: '#E87070', softLight: '#507A54',
    },
  },
  sunset: {
    label: 'Gün Batımı',
    emoji: '🌅',
    light: {
      bg: '#FFF8F0', fg: '#4A2E1A', primary: '#E8A060', secondary: '#FFD8B0',
      accent: '#FFE8D0', card: '#FFFFFF', muted: '#FFF0E0', mutedFg: '#AA7850',
      navBg: 'rgba(255,248,240,0.85)', gradient: ['#FFD8B0', '#E8A060'],
      destructive: '#E87070', softLight: '#C8A880',
    },
    dark: {
      bg: '#1E140A', fg: '#FFD8B0', primary: '#F0B070', secondary: '#3A2010',
      accent: '#2E1A0E', card: '#281A0E', muted: '#3A2010', mutedFg: '#C8A070',
      navBg: 'rgba(30,20,10,0.92)', gradient: ['#F0B070', '#CA7830'],
      destructive: '#E87070', softLight: '#8A6840',
    },
  },
  lavender: {
    label: 'Lavanta',
    emoji: '💜',
    light: {
      bg: '#F5F0FA', fg: '#2E1A4A', primary: '#9068C8', secondary: '#D4B8F0',
      accent: '#E4D4F5', card: '#FFFFFF', muted: '#EAE0F5', mutedFg: '#7A5AA0',
      navBg: 'rgba(245,240,250,0.85)', gradient: ['#D4B8F0', '#9068C8'],
      destructive: '#E87070', softLight: '#A890C0',
    },
    dark: {
      bg: '#150E22', fg: '#D4B8F0', primary: '#A078D8', secondary: '#2A1840',
      accent: '#201430', card: '#1E1230', muted: '#2A1840', mutedFg: '#A888C8',
      navBg: 'rgba(21,14,34,0.92)', gradient: ['#A078D8', '#7048A8'],
      destructive: '#E87070', softLight: '#6A4888',
    },
  },
  cherry: {
    label: 'Kiraz Çiçeği',
    emoji: '🌸',
    light: {
      bg: '#FFF0F3', fg: '#4A1A2A', primary: '#E06080', secondary: '#FFB8C8',
      accent: '#FFD8E0', card: '#FFFFFF', muted: '#FFE8EE', mutedFg: '#AA5070',
      navBg: 'rgba(255,240,243,0.85)', gradient: ['#FFB8C8', '#E06080'],
      destructive: '#D04050', softLight: '#C88898',
    },
    dark: {
      bg: '#1E0E14', fg: '#FFB8C8', primary: '#F07090', secondary: '#3A1020',
      accent: '#2E0C18', card: '#280E18', muted: '#3A1020', mutedFg: '#C88090',
      navBg: 'rgba(30,14,20,0.92)', gradient: ['#F07090', '#C04060'],
      destructive: '#D04050', softLight: '#884050',
    },
  },
  apple: {
    label: 'Apple',
    emoji: '🍎',
    light: {
      bg: '#FFFFFF', fg: '#1D1D1F', primary: '#007AFF', secondary: '#E8E8ED',
      accent: '#E5E5EA', card: '#F5F5F7', muted: '#F2F2F7', mutedFg: '#86868B',
      navBg: 'rgba(255,255,255,0.8)', gradient: ['#E8E8ED', '#D1D1D6'],
      destructive: '#FF3B30', softLight: '#AEAEB2',
    },
    dark: {
      bg: '#000000', fg: '#F5F5F7', primary: '#0A84FF', secondary: '#1C1C1E',
      accent: '#2C2C2E', card: '#1C1C1E', muted: '#2C2C2E', mutedFg: '#98989D',
      navBg: 'rgba(0,0,0,0.85)', gradient: ['#2C2C2E', '#3A3A3C'],
      destructive: '#FF453A', softLight: '#48484A',
    },
  },
  minimal: {
    label: 'Minimal',
    emoji: '◻️',
    light: {
      bg: '#FFFFFF', fg: '#111111', primary: '#111111', secondary: '#F5F5F5',
      accent: '#E8E8E8', card: '#FAFAFA', muted: '#F0F0F0', mutedFg: '#777777',
      navBg: 'rgba(255,255,255,0.9)', gradient: ['#E0E0E0', '#C8C8C8'],
      destructive: '#DC2626', softLight: '#AAAAAA',
    },
    dark: {
      bg: '#0A0A0A', fg: '#EEEEEE', primary: '#FFFFFF', secondary: '#1A1A1A',
      accent: '#222222', card: '#141414', muted: '#1E1E1E', mutedFg: '#888888',
      navBg: 'rgba(10,10,10,0.92)', gradient: ['#333333', '#444444'],
      destructive: '#EF4444', softLight: '#555555',
    },
  },
}

interface ThemeContextValue {
  themeColor: ThemeColor
  themeMode: ThemeMode
  colors: ThemeColors
  setThemeColor: (c: ThemeColor) => void
  setThemeMode: (m: ThemeMode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('planora-theme-color')
    return (saved as ThemeColor) || 'romantic'
  })
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('planora-theme-mode')
    return (saved as ThemeMode) || 'light'
  })

  const colors = themes[themeColor][themeMode]

  // CSS değişkenlerini güncelle
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--theme-bg', colors.bg)
    root.style.setProperty('--theme-fg', colors.fg)
    root.style.setProperty('--theme-primary', colors.primary)
    root.style.setProperty('--theme-secondary', colors.secondary)
    root.style.setProperty('--theme-accent', colors.accent)
    root.style.setProperty('--theme-card', colors.card)
    root.style.setProperty('--theme-muted', colors.muted)
    root.style.setProperty('--theme-muted-fg', colors.mutedFg)
    root.style.setProperty('--theme-nav-bg', colors.navBg)
    root.style.setProperty('--theme-gradient-1', colors.gradient[0])
    root.style.setProperty('--theme-gradient-2', colors.gradient[1])
    root.style.setProperty('--theme-destructive', colors.destructive)
    root.style.setProperty('--theme-soft-light', colors.softLight)

    root.setAttribute('data-theme', themeColor)
    root.setAttribute('data-mode', themeMode)
  }, [colors, themeColor, themeMode])

  // localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('planora-theme-color', themeColor)
  }, [themeColor])

  useEffect(() => {
    localStorage.setItem('planora-theme-mode', themeMode)
  }, [themeMode])

  const toggleMode = () => setThemeMode(m => m === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ themeColor, themeMode, colors, setThemeColor, setThemeMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
