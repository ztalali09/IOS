export type DrinkCategory = "coffee" | "tea" | "energy" | "soda" | "other"

export type DrinkEntry = {
  id: string
  name: string
  caffeineMg: number
  volumeMl: number
  date: Date
  category: DrinkCategory
}

export type DrinkTemplate = {
  id?: string
  name: string
  caffeineMg: number
  volumeMl: number
  category: DrinkCategory
  icon: string
  isCustom?: boolean
}

export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  condition: (stats: UserStats) => boolean
}

export type UserStats = {
  totalDrinks: number
  totalCaffeine: number
  daysUnderLimit: number
  currentStreak: number
  longestStreak: number
  favoriteDrink: string
}

export const DRINK_TEMPLATES: DrinkTemplate[] = [
  { name: "Espresso", caffeineMg: 80, volumeMl: 30, category: "coffee", icon: "coffee" },
  { name: "Double Espresso", caffeineMg: 150, volumeMl: 60, category: "coffee", icon: "coffee" },
  { name: "Latte", caffeineMg: 75, volumeMl: 240, category: "coffee", icon: "coffee" },
  { name: "Cappuccino", caffeineMg: 75, volumeMl: 180, category: "coffee", icon: "coffee" },
  { name: "Americano", caffeineMg: 95, volumeMl: 240, category: "coffee", icon: "coffee" },
  { name: "Cold Brew", caffeineMg: 200, volumeMl: 355, category: "coffee", icon: "coffee" },
  { name: "Green Tea", caffeineMg: 28, volumeMl: 240, category: "tea", icon: "leaf" },
  { name: "Black Tea", caffeineMg: 47, volumeMl: 240, category: "tea", icon: "leaf" },
  { name: "Matcha", caffeineMg: 70, volumeMl: 240, category: "tea", icon: "leaf" },
  { name: "Energy Drink", caffeineMg: 120, volumeMl: 250, category: "energy", icon: "zap" },
  { name: "Pre-Workout", caffeineMg: 200, volumeMl: 300, category: "energy", icon: "zap" },
  { name: "Cola", caffeineMg: 34, volumeMl: 355, category: "soda", icon: "glass-water" },
  { name: "Diet Cola", caffeineMg: 46, volumeMl: 355, category: "soda", icon: "glass-water" },
]

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-drink",
    title: "First Sip",
    description: "Log your first drink",
    icon: "coffee",
    condition: (stats) => stats.totalDrinks >= 1,
  },
  {
    id: "week-streak",
    title: "Week Warrior",
    description: "Stay under limit for 7 days",
    icon: "trophy",
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: "month-streak",
    title: "Monthly Master",
    description: "Stay under limit for 30 days",
    icon: "medal",
    condition: (stats) => stats.currentStreak >= 30,
  },
  {
    id: "ten-drinks",
    title: "Regular",
    description: "Log 10 drinks",
    icon: "star",
    condition: (stats) => stats.totalDrinks >= 10,
  },
  {
    id: "fifty-drinks",
    title: "Caffeine Enthusiast",
    description: "Log 50 drinks",
    icon: "award",
    condition: (stats) => stats.totalDrinks >= 50,
  },
]

export const DEFAULT_DAILY_LIMIT = 400
export const CAFFEINE_HALF_LIFE_HOURS = 5
export const RECOMMENDED_CUTOFF_HOURS = 6 // Hours before bedtime to stop caffeine
