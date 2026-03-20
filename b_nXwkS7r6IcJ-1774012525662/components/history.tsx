"use client"

import { Coffee, Leaf, Zap, GlassWater, Trash2, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import type { DrinkEntry, DrinkCategory } from "@/lib/types"
import { format, isToday, isYesterday } from "date-fns"
import { cn } from "@/lib/utils"

const categoryIcons: Record<DrinkCategory, React.ComponentType<{ className?: string }>> = {
  coffee: Coffee,
  tea: Leaf,
  energy: Zap,
  soda: GlassWater,
  other: Coffee,
}

interface GroupedDrinks {
  label: string
  drinks: DrinkEntry[]
  totalCaffeine: number
}

function groupDrinksByDate(drinks: DrinkEntry[]): GroupedDrinks[] {
  const sorted = [...drinks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const groups: GroupedDrinks[] = []
  let currentGroup: GroupedDrinks | null = null

  for (const drink of sorted) {
    const drinkDate = new Date(drink.date)
    let label: string

    if (isToday(drinkDate)) {
      label = "Today"
    } else if (isYesterday(drinkDate)) {
      label = "Yesterday"
    } else {
      label = format(drinkDate, "EEEE, MMMM d")
    }

    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = { label, drinks: [], totalCaffeine: 0 }
      groups.push(currentGroup)
    }
    currentGroup.drinks.push(drink)
    currentGroup.totalCaffeine += drink.caffeineMg
  }

  return groups
}

export function History() {
  const { drinks, removeDrink } = useAppStore()
  const groupedDrinks = groupDrinksByDate(drinks)

  if (drinks.length === 0) {
    return (
      <div className="gradient-bg flex min-h-[60vh] flex-col items-center justify-center px-4 pb-28 pt-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full glass-card">
            <Coffee className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gradient">No drinks yet</h2>
        <p className="mt-2 max-w-xs text-center text-muted-foreground">
          Start tracking your caffeine intake by adding your first drink.
        </p>
      </div>
    )
  }

  return (
    <div className="gradient-bg flex flex-col gap-6 px-4 pb-28 pt-6">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-32 bottom-40 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-gradient">History</h1>
        <p className="text-muted-foreground">Your caffeine log</p>
      </div>

      {/* Stats summary */}
      <div className="relative z-10 glass-card flex items-center justify-between rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md shadow-primary/20">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total logged</p>
            <p className="font-bold text-foreground">{drinks.length} drinks</p>
          </div>
        </div>
      </div>

      {/* Grouped drinks */}
      {groupedDrinks.map((group, groupIndex) => (
        <div key={group.label} className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h2>
            <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              {group.totalCaffeine}mg total
            </span>
          </div>
          {group.drinks.map((drink, drinkIndex) => {
            const Icon = categoryIcons[drink.category]
            const isEven = (groupIndex + drinkIndex) % 2 === 0
            return (
              <Card
                key={drink.id}
                className="glass-card overflow-hidden border-0 transition-all hover:scale-[1.01]"
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
                    isEven ? "gradient-primary shadow-primary/20" : "gradient-accent shadow-accent/20"
                  )}>
                    <Icon className={cn(
                      "h-7 w-7",
                      isEven ? "text-primary-foreground" : "text-accent-foreground"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{drink.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{format(new Date(drink.date), "HH:mm")}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                      <span className="font-semibold text-primary">{drink.caffeineMg}mg</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeDrink(drink.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ))}
    </div>
  )
}
