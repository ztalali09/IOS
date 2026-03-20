"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DrinkEntry, DrinkTemplate, UserStats } from "./types"
import { DEFAULT_DAILY_LIMIT, CAFFEINE_HALF_LIFE_HOURS } from "./types"

interface AppState {
  hasOnboarded: boolean
  setHasOnboarded: (value: boolean) => void
  drinks: DrinkEntry[]
  addDrink: (drink: Omit<DrinkEntry, "id">) => void
  removeDrink: (id: string) => void
  updateDrink: (id: string, drink: Partial<DrinkEntry>) => void
  dailyLimit: number
  setDailyLimit: (limit: number) => void
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  bedtime: string // Format: "HH:MM"
  setBedtime: (time: string) => void
  customDrinks: DrinkTemplate[]
  addCustomDrink: (drink: DrinkTemplate) => void
  removeCustomDrink: (name: string) => void
  unlockedAchievements: string[]
  unlockAchievement: (id: string) => void
  quickAddDrinks: string[] // Names of favorite drinks for quick add
  setQuickAddDrinks: (drinks: string[]) => void
  addToFavorites: (drinkName: string) => void
  removeFromFavorites: (drinkName: string) => void
}

// Mock data for demonstration
const mockDrinks: DrinkEntry[] = [
  {
    id: "1",
    name: "Espresso",
    caffeineMg: 80,
    volumeMl: 30,
    date: new Date(new Date().setHours(10, 30)),
    category: "coffee",
  },
  {
    id: "2",
    name: "Latte",
    caffeineMg: 75,
    volumeMl: 240,
    date: new Date(new Date().setHours(8, 0)),
    category: "coffee",
  },
  {
    id: "3",
    name: "Energy Drink",
    caffeineMg: 120,
    volumeMl: 250,
    date: new Date(Date.now() - 86400000 + 14 * 3600000),
    category: "energy",
  },
  {
    id: "4",
    name: "Tea",
    caffeineMg: 40,
    volumeMl: 240,
    date: new Date(Date.now() - 86400000 + 16 * 3600000),
    category: "tea",
  },
  {
    id: "5",
    name: "Espresso",
    caffeineMg: 80,
    volumeMl: 30,
    date: new Date(Date.now() - 2 * 86400000 + 9 * 3600000),
    category: "coffee",
  },
]

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      setHasOnboarded: (value) => set({ hasOnboarded: value }),
      drinks: mockDrinks,
      addDrink: (drink) =>
        set((state) => ({
          drinks: [
            ...state.drinks,
            { ...drink, id: Math.random().toString(36).substring(7) },
          ],
        })),
      removeDrink: (id) =>
        set((state) => ({
          drinks: state.drinks.filter((d) => d.id !== id),
        })),
      updateDrink: (id, drink) =>
        set((state) => ({
          drinks: state.drinks.map((d) =>
            d.id === id ? { ...d, ...drink } : d
          ),
        })),
      dailyLimit: DEFAULT_DAILY_LIMIT,
      setDailyLimit: (limit) => set({ dailyLimit: limit }),
      darkMode: false,
      setDarkMode: (value) => set({ darkMode: value }),
      bedtime: "23:00",
      setBedtime: (time) => set({ bedtime: time }),
      customDrinks: [],
      addCustomDrink: (drink) =>
        set((state) => ({
          customDrinks: [...state.customDrinks, { ...drink, isCustom: true }],
        })),
      removeCustomDrink: (name) =>
        set((state) => ({
          customDrinks: state.customDrinks.filter((d) => d.name !== name),
        })),
      unlockedAchievements: [],
      unlockAchievement: (id) =>
        set((state) => ({
          unlockedAchievements: state.unlockedAchievements.includes(id)
            ? state.unlockedAchievements
            : [...state.unlockedAchievements, id],
        })),
      quickAddDrinks: ["Espresso", "Latte", "Tea"],
      setQuickAddDrinks: (drinks) => set({ quickAddDrinks: drinks }),
      addToFavorites: (drinkName) =>
        set((state) => ({
          quickAddDrinks: state.quickAddDrinks.includes(drinkName)
            ? state.quickAddDrinks
            : [...state.quickAddDrinks, drinkName],
        })),
      removeFromFavorites: (drinkName) =>
        set((state) => ({
          quickAddDrinks: state.quickAddDrinks.filter((d) => d !== drinkName),
        })),
    }),
    {
      name: "caffeine-tracker-storage",
    }
  )
)

// Helper functions
export function getTodaysDrinks(drinks: DrinkEntry[]): DrinkEntry[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return drinks.filter((d) => new Date(d.date) >= today)
}

export function getTodaysCaffeine(drinks: DrinkEntry[]): number {
  return getTodaysDrinks(drinks).reduce((sum, d) => sum + d.caffeineMg, 0)
}

export function getActiveCaffeine(drinks: DrinkEntry[]): number {
  const now = Date.now()
  const halfLife = 5 * 60 * 60 * 1000 // 5 hours in ms
  
  return Math.round(
    drinks.reduce((sum, d) => {
      const elapsed = now - new Date(d.date).getTime()
      if (elapsed < 0) return sum
      const remaining = d.caffeineMg * Math.pow(0.5, elapsed / halfLife)
      return sum + remaining
    }, 0)
  )
}

export function getLastDrink(drinks: DrinkEntry[]): DrinkEntry | null {
  if (drinks.length === 0) return null
  const sorted = [...drinks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sorted[0]
}

export function getCutoffTime(bedtime: string): string {
  const [hours, minutes] = bedtime.split(":").map(Number)
  const cutoffHours = hours - 6 // 6 hours before bedtime
  const adjustedHours = cutoffHours < 0 ? cutoffHours + 24 : cutoffHours
  return `${adjustedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function getSleepImpact(activeCaffeine: number): { level: string; description: string; color: string } {
  if (activeCaffeine < 50) {
    return { level: "Minimal", description: "Should not affect sleep", color: "text-green-500" }
  } else if (activeCaffeine < 100) {
    return { level: "Low", description: "Slight impact possible", color: "text-yellow-500" }
  } else if (activeCaffeine < 200) {
    return { level: "Moderate", description: "May delay sleep onset", color: "text-orange-500" }
  } else {
    return { level: "High", description: "Likely to affect sleep quality", color: "text-red-500" }
  }
}

export function getWeeklyStats(drinks: DrinkEntry[]): { day: string; caffeine: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const now = new Date()
  const result: { day: string; caffeine: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const dayCaffeine = drinks
      .filter((d) => {
        const drinkDate = new Date(d.date)
        return drinkDate >= date && drinkDate < nextDate
      })
      .reduce((sum, d) => sum + d.caffeineMg, 0)

    result.push({ day: days[date.getDay()], caffeine: dayCaffeine })
  }

  return result
}

export function getUserStats(drinks: DrinkEntry[], dailyLimit: number): UserStats {
  const drinkCounts: Record<string, number> = {}
  drinks.forEach((d) => {
    drinkCounts[d.name] = (drinkCounts[d.name] || 0) + 1
  })
  const favoriteDrink = Object.entries(drinkCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"

  // Calculate streak
  let currentStreak = 0
  let longestStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const nextDate = new Date(checkDate)
    nextDate.setDate(nextDate.getDate() + 1)

    const dayCaffeine = drinks
      .filter((d) => {
        const drinkDate = new Date(d.date)
        return drinkDate >= checkDate && drinkDate < nextDate
      })
      .reduce((sum, d) => sum + d.caffeineMg, 0)

    if (dayCaffeine <= dailyLimit && dayCaffeine > 0) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else if (dayCaffeine > dailyLimit) {
      break
    }
  }

  return {
    totalDrinks: drinks.length,
    totalCaffeine: drinks.reduce((sum, d) => sum + d.caffeineMg, 0),
    daysUnderLimit: currentStreak,
    currentStreak,
    longestStreak,
    favoriteDrink,
  }
}
