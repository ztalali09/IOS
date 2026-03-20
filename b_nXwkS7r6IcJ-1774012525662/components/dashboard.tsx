"use client"

import { Coffee, Zap, Clock, Plus, Moon, AlertCircle, Flame, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "./progress-ring"
import { useAppStore, getTodaysCaffeine, getActiveCaffeine, getLastDrink, getCutoffTime, getSleepImpact, getUserStats } from "@/lib/store"
import { format } from "date-fns"
import { DRINK_TEMPLATES } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DashboardProps {
  onAddDrink: () => void
}

export function Dashboard({ onAddDrink }: DashboardProps) {
  const { drinks, dailyLimit, bedtime, quickAddDrinks, addDrink, customDrinks } = useAppStore()
  
  const todaysCaffeine = getTodaysCaffeine(drinks)
  const activeCaffeine = getActiveCaffeine(drinks)
  const lastDrink = getLastDrink(drinks)
  const remaining = Math.max(0, dailyLimit - todaysCaffeine)
  const progress = Math.min((todaysCaffeine / dailyLimit) * 100, 100)
  const cutoffTime = getCutoffTime(bedtime)
  const sleepImpact = getSleepImpact(activeCaffeine)
  const userStats = getUserStats(drinks, dailyLimit)
  
  const now = new Date()
  const [cutoffHours, cutoffMinutes] = cutoffTime.split(":").map(Number)
  const isPastCutoff = now.getHours() > cutoffHours || (now.getHours() === cutoffHours && now.getMinutes() >= cutoffMinutes)

  const allDrinks = [...DRINK_TEMPLATES, ...customDrinks]

  const handleQuickAdd = (drinkName: string) => {
    const template = allDrinks.find((d) => d.name === drinkName)
    if (template) {
      addDrink({
        name: template.name,
        caffeineMg: template.caffeineMg,
        volumeMl: template.volumeMl,
        date: new Date(),
        category: template.category,
      })
    }
  }

  return (
    <div className="gradient-bg flex flex-col gap-4 px-4 pb-32 pt-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold">
          <span className="text-gradient">Today</span>
        </h1>
        <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      {/* Streak Banner */}
      {userStats.currentStreak > 0 && (
        <div className="glass-card flex items-center gap-3 rounded-2xl p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary caffeine-glow-sm">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{userStats.currentStreak} Day Streak</p>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </div>
        </div>
      )}

      {/* Daily Progress Card */}
      <Card className="glass-card overflow-hidden border-0">
        <CardContent className="relative flex flex-col items-center py-10">
          {/* Glow effect behind ring */}
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          
          <div className="relative">
            <ProgressRing progress={progress} size={200} strokeWidth={16}>
              <div className="flex flex-col items-center">
                <span className={cn(
                  "text-5xl font-bold tracking-tight",
                  todaysCaffeine > dailyLimit ? "text-destructive" : "text-gradient"
                )}>
                  {todaysCaffeine}
                </span>
                <span className="text-sm font-medium text-muted-foreground">mg caffeine</span>
              </div>
            </ProgressRing>
          </div>
          
          <div className="mt-6 flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              todaysCaffeine > dailyLimit ? "bg-destructive animate-pulse" : "bg-primary"
            )} />
            <p className={cn(
              "text-sm font-medium",
              todaysCaffeine > dailyLimit ? "text-destructive" : "text-muted-foreground"
            )}>
              {todaysCaffeine > dailyLimit 
                ? `${todaysCaffeine - dailyLimit} mg over limit`
                : `${remaining} mg remaining`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Section */}
      <Card className="glass-card border-0">
        <CardContent className="py-4">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Quick Add</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAddDrinks.map((drinkName) => {
              const template = allDrinks.find((d) => d.name === drinkName)
              if (!template) return null
              return (
                <Button
                  key={drinkName}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAdd(drinkName)}
                  className="h-10 gap-2 rounded-xl border border-border/50 bg-secondary/50 backdrop-blur-sm transition-all hover:bg-secondary hover:scale-105 active:scale-95"
                >
                  <Coffee className="h-4 w-4 text-primary" />
                  <span>{drinkName}</span>
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    {template.caffeineMg}mg
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Caffeine Cutoff Warning */}
      {isPastCutoff && (
        <Card className="border border-accent/30 bg-accent/10 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 animate-pulse-glow">
              <AlertCircle className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-accent">Caffeine Cutoff Passed</p>
              <p className="text-xs text-muted-foreground">
                No caffeine recommended after {cutoffTime} for quality sleep
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Remaining Card */}
        <Card className="glass-card border-0">
          <CardContent className="flex flex-col gap-3 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
              <Coffee className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={cn(
                "text-xl font-bold",
                remaining === 0 ? "text-destructive" : "text-foreground"
              )}>
                {remaining > 0 ? `${remaining}mg` : "0mg"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Caffeine Card */}
        <Card className="glass-card border-0">
          <CardContent className="flex flex-col gap-3 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-accent shadow-lg shadow-accent/20">
              <Zap className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold text-foreground">{activeCaffeine}mg</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Impact Card */}
      <Card className="glass-card border-0">
        <CardContent className="flex items-center gap-4 py-5">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20">
              <Moon className="h-7 w-7 text-indigo-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-indigo-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sleep Impact</p>
            <p className={cn("text-xl font-bold", sleepImpact.color)}>{sleepImpact.level}</p>
            <p className="text-xs text-muted-foreground">{sleepImpact.description}</p>
          </div>
          <TrendingUp className={cn("h-5 w-5", sleepImpact.color)} />
        </CardContent>
      </Card>

      {/* Last Drink Card */}
      {lastDrink && (
        <Card className="glass-card border-0">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <Clock className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Drink</p>
              <p className="text-lg font-bold text-foreground">{lastDrink.name}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(lastDrink.date), "HH:mm")} · {lastDrink.caffeineMg}mg
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 transform">
        <Button
          onClick={onAddDrink}
          size="lg"
          className="h-16 w-16 rounded-full gradient-primary shadow-2xl shadow-primary/40 transition-all hover:scale-110 hover:shadow-primary/50 active:scale-95 caffeine-glow animate-pulse-glow"
        >
          <Plus className="h-7 w-7" />
          <span className="sr-only">Add Drink</span>
        </Button>
      </div>
    </div>
  )
}
