"use client"

import { useState } from "react"
import { Coffee, Moon, Download, ChevronRight, Check, Clock, Plus, Trash2, Star, X, Sparkles, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useAppStore, getCutoffTime } from "@/lib/store"
import { DRINK_TEMPLATES } from "@/lib/types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function Settings() {
  const { 
    dailyLimit, setDailyLimit, 
    darkMode, setDarkMode,
    bedtime, setBedtime,
    customDrinks, addCustomDrink, removeCustomDrink,
    quickAddDrinks, setQuickAddDrinks,
    drinks
  } = useAppStore()
  
  const [editingLimit, setEditingLimit] = useState(false)
  const [limitValue, setLimitValue] = useState(dailyLimit.toString())
  const [editingBedtime, setEditingBedtime] = useState(false)
  const [bedtimeValue, setBedtimeValue] = useState(bedtime)
  const [showCustomDrinkForm, setShowCustomDrinkForm] = useState(false)
  const [newDrink, setNewDrink] = useState({ name: "", caffeineMg: "", volumeMl: "" })
  const [showQuickAddEditor, setShowQuickAddEditor] = useState(false)

  const allDrinks = [...DRINK_TEMPLATES, ...customDrinks]
  const cutoffTime = getCutoffTime(bedtime)

  const handleSaveLimit = () => {
    const value = parseInt(limitValue)
    if (!isNaN(value) && value > 0) {
      setDailyLimit(value)
    }
    setEditingLimit(false)
  }

  const handleSaveBedtime = () => {
    setBedtime(bedtimeValue)
    setEditingBedtime(false)
  }

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked)
    document.documentElement.classList.toggle("dark", checked)
  }

  const handleAddCustomDrink = () => {
    if (newDrink.name && newDrink.caffeineMg && newDrink.volumeMl) {
      addCustomDrink({
        name: newDrink.name,
        caffeineMg: parseInt(newDrink.caffeineMg),
        volumeMl: parseInt(newDrink.volumeMl),
        category: "other",
        icon: "coffee",
        isCustom: true,
      })
      setNewDrink({ name: "", caffeineMg: "", volumeMl: "" })
      setShowCustomDrinkForm(false)
    }
  }

  const handleExport = () => {
    const data = {
      drinks: drinks.map(d => ({
        ...d,
        date: format(new Date(d.date), "yyyy-MM-dd HH:mm")
      })),
      settings: { dailyLimit, bedtime },
      exportedAt: format(new Date(), "yyyy-MM-dd HH:mm")
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `caffeine-tracker-${format(new Date(), "yyyy-MM-dd")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleQuickAddDrink = (drinkName: string) => {
    if (quickAddDrinks.includes(drinkName)) {
      setQuickAddDrinks(quickAddDrinks.filter(d => d !== drinkName))
    } else if (quickAddDrinks.length < 5) {
      setQuickAddDrinks([...quickAddDrinks, drinkName])
    }
  }

  return (
    <div className="gradient-bg flex flex-col gap-4 px-4 pb-28 pt-6">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-32 bottom-40 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-2">
        <h1 className="text-3xl font-bold text-gradient">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      {/* Daily Limit */}
      <Card className="relative z-10 glass-card border-0">
        <CardContent className="py-4">
          <button
            onClick={() => setEditingLimit(!editingLimit)}
            className="flex w-full items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/20">
              <Coffee className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-foreground">Daily Caffeine Limit</p>
              <p className="text-sm text-muted-foreground">{dailyLimit} mg maximum</p>
            </div>
            <ChevronRight className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-300",
              editingLimit && "rotate-90"
            )} />
          </button>
          
          {editingLimit && (
            <div className="mt-4 flex gap-3 border-t border-border/50 pt-4">
              <Input
                type="number"
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                className="h-12 flex-1 rounded-xl border-border/50 bg-card/50 text-foreground backdrop-blur-sm"
                placeholder="Enter limit in mg"
              />
              <Button
                onClick={handleSaveLimit}
                size="icon"
                className="h-12 w-12 rounded-xl gradient-primary shadow-lg shadow-primary/20"
              >
                <Check className="h-5 w-5" />
                <span className="sr-only">Save</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bedtime */}
      <Card className="relative z-10 glass-card border-0">
        <CardContent className="py-4">
          <button
            onClick={() => setEditingBedtime(!editingBedtime)}
            className="flex w-full items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <Clock className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-foreground">Bedtime</p>
              <p className="text-sm text-muted-foreground">
                {bedtime} <span className="text-indigo-400">(Cutoff: {cutoffTime})</span>
              </p>
            </div>
            <ChevronRight className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-300",
              editingBedtime && "rotate-90"
            )} />
          </button>
          
          {editingBedtime && (
            <div className="mt-4 flex gap-3 border-t border-border/50 pt-4">
              <Input
                type="time"
                value={bedtimeValue}
                onChange={(e) => setBedtimeValue(e.target.value)}
                className="h-12 flex-1 rounded-xl border-border/50 bg-card/50 text-foreground backdrop-blur-sm"
              />
              <Button
                onClick={handleSaveBedtime}
                size="icon"
                className="h-12 w-12 rounded-xl gradient-primary shadow-lg shadow-primary/20"
              >
                <Check className="h-5 w-5" />
                <span className="sr-only">Save</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dark Mode */}
      <Card className="relative z-10 glass-card border-0">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shadow-lg">
              <Moon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Reduce eye strain</p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Drinks */}
      <Card className="relative z-10 glass-card border-0">
        <CardContent className="py-4">
          <button
            onClick={() => setShowQuickAddEditor(!showQuickAddEditor)}
            className="flex w-full items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-foreground">Quick Add Drinks</p>
              <p className="text-sm text-muted-foreground">{quickAddDrinks.length} drinks selected</p>
            </div>
            <ChevronRight className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-300",
              showQuickAddEditor && "rotate-90"
            )} />
          </button>
          
          {showQuickAddEditor && (
            <div className="mt-4 border-t border-border/50 pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Select up to 5 drinks for quick access</p>
              <div className="flex flex-wrap gap-2">
                {allDrinks.slice(0, 10).map((drink) => (
                  <button
                    key={drink.name}
                    onClick={() => toggleQuickAddDrink(drink.name)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                      quickAddDrinks.includes(drink.name)
                        ? "gradient-primary shadow-lg shadow-primary/20 text-primary-foreground"
                        : "glass-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {drink.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Drinks */}
      <Card className="relative z-10 glass-card border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Settings2 className="h-5 w-5 text-primary" />
              Custom Drinks
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomDrinkForm(!showCustomDrinkForm)}
              className={cn(
                "h-9 w-9 rounded-xl p-0 transition-all",
                showCustomDrinkForm ? "bg-destructive/10 text-destructive" : "hover:bg-primary/10"
              )}
            >
              {showCustomDrinkForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCustomDrinkForm && (
            <div className="mb-4 space-y-3 rounded-2xl bg-card/50 p-4 backdrop-blur-sm">
              <Input
                placeholder="Drink name"
                value={newDrink.name}
                onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
                className="h-11 rounded-xl border-border/50 bg-background/50"
              />
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Caffeine (mg)"
                  value={newDrink.caffeineMg}
                  onChange={(e) => setNewDrink({ ...newDrink, caffeineMg: e.target.value })}
                  className="h-11 flex-1 rounded-xl border-border/50 bg-background/50"
                />
                <Input
                  type="number"
                  placeholder="Volume (ml)"
                  value={newDrink.volumeMl}
                  onChange={(e) => setNewDrink({ ...newDrink, volumeMl: e.target.value })}
                  className="h-11 flex-1 rounded-xl border-border/50 bg-background/50"
                />
              </div>
              <Button 
                onClick={handleAddCustomDrink} 
                className="w-full rounded-xl gradient-primary font-semibold shadow-lg shadow-primary/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Drink
              </Button>
            </div>
          )}
          
          {customDrinks.length === 0 ? (
            <div className="py-6 text-center">
              <Coffee className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No custom drinks yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customDrinks.map((drink, index) => (
                <div 
                  key={drink.name} 
                  className={cn(
                    "flex items-center justify-between rounded-xl p-4 transition-all",
                    index % 2 === 0 ? "bg-primary/5" : "bg-accent/5"
                  )}
                >
                  <div>
                    <p className="font-semibold text-foreground">{drink.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">{drink.caffeineMg}mg</span> - {drink.volumeMl}ml
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomDrink(drink.name)}
                    className="h-9 w-9 rounded-xl p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card className="relative z-10 glass-card border-0">
        <CardContent className="py-4">
          <button
            onClick={handleExport}
            className="flex w-full items-center gap-4 transition-all hover:opacity-80"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent shadow-lg shadow-accent/20">
              <Download className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-foreground">Export Data</p>
              <p className="text-sm text-muted-foreground">Download your caffeine log as JSON</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* About */}
      <div className="relative z-10 mt-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-gradient">Caffeine Tracker v2.0</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Track your daily caffeine intake with smart insights
        </p>
      </div>
    </div>
  )
}
