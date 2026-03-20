"use client"

import { Coffee, TrendingUp, Heart, Trophy, Award, Star, Flame, Zap, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore, getUserStats } from "@/lib/store"
import type { DrinkEntry } from "@/lib/types"
import { ACHIEVEMENTS } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  Tooltip,
} from "recharts"
import { startOfWeek, addDays, isSameDay, subDays, format } from "date-fns"
import { cn } from "@/lib/utils"

function getWeeklyData(drinks: DrinkEntry[]) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return days.map((day, index) => {
    const date = addDays(weekStart, index)
    const dayDrinks = drinks.filter((d) => isSameDay(new Date(d.date), date))
    const total = dayDrinks.reduce((sum, d) => sum + d.caffeineMg, 0)
    return { day, caffeine: total, date }
  })
}

function getLast30DaysData(drinks: DrinkEntry[]) {
  const result = []
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = subDays(now, i)
    const dayDrinks = drinks.filter((d) => isSameDay(new Date(d.date), date))
    const total = dayDrinks.reduce((sum, d) => sum + d.caffeineMg, 0)
    result.push({ 
      day: format(date, "d"), 
      caffeine: total,
      fullDate: format(date, "MMM d")
    })
  }
  
  return result
}

function getWeeklyTotal(drinks: DrinkEntry[]): number {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  return drinks
    .filter((d) => new Date(d.date) >= weekStart)
    .reduce((sum, d) => sum + d.caffeineMg, 0)
}

function getDailyAverage(drinks: DrinkEntry[]): number {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDrinks = drinks.filter((d) => new Date(d.date) >= weekStart)
  const total = weekDrinks.reduce((sum, d) => sum + d.caffeineMg, 0)
  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
  return Math.round(total / dayOfWeek)
}

function getIconComponent(iconName: string) {
  switch (iconName) {
    case "trophy": return Trophy
    case "medal": return Award
    case "star": return Star
    case "award": return Award
    default: return Coffee
  }
}

export function Stats() {
  const { drinks, dailyLimit, unlockedAchievements, unlockAchievement } = useAppStore()
  const weeklyData = getWeeklyData(drinks)
  const last30Days = getLast30DaysData(drinks)
  const userStats = getUserStats(drinks, dailyLimit)
  const weeklyTotal = getWeeklyTotal(drinks)
  const dailyAverage = getDailyAverage(drinks)

  const maxCaffeine = Math.max(...weeklyData.map((d) => d.caffeine), dailyLimit)

  // Check and unlock achievements
  ACHIEVEMENTS.forEach((achievement) => {
    if (!unlockedAchievements.includes(achievement.id) && achievement.condition(userStats)) {
      unlockAchievement(achievement.id)
    }
  })

  return (
    <div className="gradient-bg flex flex-col gap-4 px-4 pb-28 pt-6">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-32 bottom-40 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-2">
        <h1 className="text-3xl font-bold text-gradient">Statistics</h1>
        <p className="text-muted-foreground">Your caffeine insights</p>
      </div>

      {/* Streak Card */}
      <Card className="relative z-10 overflow-hidden border-0 gradient-primary shadow-xl shadow-primary/30">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="relative flex items-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">Current Streak</p>
            <p className="text-4xl font-bold text-white">{userStats.currentStreak}</p>
            <p className="text-xs text-white/70">days · Best: {userStats.longestStreak}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {[...Array(Math.min(5, userStats.currentStreak))].map((_, i) => (
              <Flame key={i} className={cn(
                "h-4 w-4 text-white",
                i < 3 ? "opacity-100" : "opacity-50"
              )} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Chart */}
      <Card className="relative z-10 glass-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.19 55)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.2 35)" />
                  </linearGradient>
                  <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 25)" />
                    <stop offset="100%" stopColor="oklch(0.45 0.2 15)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0.04 60)", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0.04 60)", fontSize: 12 }}
                  domain={[0, maxCaffeine]}
                />
                <Bar dataKey="caffeine" radius={[8, 8, 0, 0]} maxBarSize={36}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.caffeine > dailyLimit ? "url(#dangerGradient)" : "url(#barGradient)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md gradient-primary" />
              <span className="text-muted-foreground">Under limit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md bg-destructive" />
              <span className="text-muted-foreground">Over limit</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 30 Day Trend */}
      <Card className="relative z-10 glass-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <TrendingUp className="h-5 w-5 text-accent" />
            30 Day Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30Days} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.75 0.18 55)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.75 0.18 55)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="caffeine" 
                  stroke="oklch(0.75 0.18 55)" 
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-card rounded-xl p-3 shadow-xl">
                          <p className="text-xs text-muted-foreground">{payload[0].payload.fullDate}</p>
                          <p className="text-lg font-bold text-gradient">{payload[0].value} mg</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <Card className="glass-card border-0">
          <CardContent className="py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/20">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gradient">{dailyAverage}</p>
            <p className="text-xs font-medium text-muted-foreground">mg daily avg</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent shadow-lg shadow-accent/20">
              <Heart className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="mt-4 text-lg font-bold text-foreground truncate">{userStats.favoriteDrink}</p>
            <p className="text-xs font-medium text-muted-foreground">favorite drink</p>
          </CardContent>
        </Card>
      </div>

      <Card className="relative z-10 glass-card border-0">
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Coffee className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold text-gradient">{weeklyTotal}</p>
            <p className="text-sm text-muted-foreground">mg this week</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{userStats.totalDrinks}</p>
            <p className="text-xs text-muted-foreground">total drinks</p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="relative z-10 glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements
            <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-500">
              {unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id)
              const Icon = getIconComponent(achievement.icon)
              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "relative flex flex-col items-center rounded-2xl p-4 text-center transition-all",
                    isUnlocked 
                      ? "glass-card" 
                      : "bg-muted/30 opacity-60"
                  )}
                >
                  {isUnlocked && (
                    <div className="absolute inset-0 rounded-2xl bg-amber-500/10" />
                  )}
                  <div className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                    isUnlocked 
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30" 
                      : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6",
                      isUnlocked ? "text-white" : "text-muted-foreground"
                    )} />
                  </div>
                  <p className={cn(
                    "relative mt-3 text-xs font-semibold",
                    isUnlocked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {achievement.title}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
