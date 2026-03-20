"use client"

import { useState, useMemo } from "react"
import { Coffee, Leaf, Zap, GlassWater, ChevronLeft, X, Search, Star, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DRINK_TEMPLATES, type DrinkTemplate, type DrinkCategory } from "@/lib/types"
import { useAppStore, getTodaysCaffeine } from "@/lib/store"
import { cn } from "@/lib/utils"

interface AddDrinkProps {
  onClose: () => void
}

const categoryIcons: Record<DrinkCategory, React.ComponentType<{ className?: string }>> = {
  coffee: Coffee,
  tea: Leaf,
  energy: Zap,
  soda: GlassWater,
  other: Coffee,
}

const categories: { id: DrinkCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee" },
  { id: "tea", label: "Tea" },
  { id: "energy", label: "Energy" },
  { id: "soda", label: "Soda" },
]

export function AddDrink({ onClose }: AddDrinkProps) {
  const { addDrink, customDrinks, quickAddDrinks, drinks, dailyLimit } = useAppStore()
  const [selectedTemplate, setSelectedTemplate] = useState<DrinkTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory | "all">("all")
  const [formData, setFormData] = useState({
    name: "",
    caffeineMg: 0,
    volumeMl: 0,
    time: new Date().toTimeString().slice(0, 5),
  })

  const allDrinks = useMemo(() => [...DRINK_TEMPLATES, ...customDrinks], [customDrinks])
  const todaysCaffeine = getTodaysCaffeine(drinks)
  const remaining = Math.max(0, dailyLimit - todaysCaffeine)

  const filteredDrinks = useMemo(() => {
    return allDrinks.filter((drink) => {
      const matchesSearch = drink.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || drink.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [allDrinks, searchQuery, selectedCategory])

  const handleSelectTemplate = (template: DrinkTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      caffeineMg: template.caffeineMg,
      volumeMl: template.volumeMl,
      time: new Date().toTimeString().slice(0, 5),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const [hours, minutes] = formData.time.split(":").map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)

    addDrink({
      name: formData.name,
      caffeineMg: formData.caffeineMg,
      volumeMl: formData.volumeMl,
      date,
      category: selectedTemplate?.category || "other",
    })
    onClose()
  }

  if (selectedTemplate) {
    const Icon = categoryIcons[selectedTemplate.category]
    const wouldExceedLimit = todaysCaffeine + formData.caffeineMg > dailyLimit
    
    return (
      <div className="gradient-bg flex min-h-screen flex-col">
        {/* Background effects */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -right-32 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-32 bottom-40 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedTemplate(null)}
            className="h-11 w-11 rounded-full border border-border/50 backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-xl font-bold text-gradient">Add Drink</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-auto h-11 w-11 rounded-full border border-border/50 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 flex flex-1 flex-col gap-6 p-4">
          {/* Selected drink preview */}
          <Card className="glass-card overflow-hidden border-0">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-lg shadow-accent/30">
                  <Icon className="h-8 w-8 text-accent-foreground" />
                </div>
                <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{selectedTemplate.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.caffeineMg} mg caffeine · {selectedTemplate.volumeMl} ml
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Warning if exceeding limit */}
          {wouldExceedLimit && (
            <div className="glass-card rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-center">
              <p className="text-sm font-semibold text-destructive">
                This will exceed your daily limit by {todaysCaffeine + formData.caffeineMg - dailyLimit} mg
              </p>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                Drink Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-13 rounded-xl border-border/50 bg-card/50 text-foreground backdrop-blur-sm focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volume" className="text-sm font-semibold text-foreground">
                  Volume (ml)
                </Label>
                <Input
                  id="volume"
                  type="number"
                  value={formData.volumeMl}
                  onChange={(e) => setFormData({ ...formData, volumeMl: Number(e.target.value) })}
                  className="h-13 rounded-xl border-border/50 bg-card/50 text-foreground backdrop-blur-sm focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caffeine" className="text-sm font-semibold text-foreground">
                  Caffeine (mg)
                </Label>
                <Input
                  id="caffeine"
                  type="number"
                  value={formData.caffeineMg}
                  onChange={(e) => setFormData({ ...formData, caffeineMg: Number(e.target.value) })}
                  className="h-13 rounded-xl border-border/50 bg-card/50 text-foreground backdrop-blur-sm focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold text-foreground">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="h-13 rounded-xl border-border/50 bg-card/50 text-foreground backdrop-blur-sm focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="glass-card flex items-center justify-between rounded-xl p-4">
              <span className="text-sm text-muted-foreground">After adding:</span>
              <span className={cn(
                "text-lg font-bold",
                wouldExceedLimit ? "text-destructive" : "text-gradient"
              )}>
                {todaysCaffeine + formData.caffeineMg} / {dailyLimit} mg
              </span>
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 w-full rounded-2xl gradient-primary text-lg font-bold shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Add Drink
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="gradient-bg flex min-h-screen flex-col">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-32 bottom-40 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient">Select a Drink</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-11 w-11 rounded-full border border-border/50 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {/* Remaining caffeine indicator */}
        <div className="mt-4 glass-card flex items-center justify-between rounded-2xl p-4">
          <span className="text-sm text-muted-foreground">Remaining today:</span>
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              remaining === 0 ? "bg-destructive animate-pulse" : "bg-primary"
            )} />
            <span className={cn(
              "text-lg font-bold",
              remaining === 0 ? "text-destructive" : "text-gradient"
            )}>
              {remaining} mg
            </span>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="relative z-10 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border-border/50 bg-card/50 pl-12 text-foreground backdrop-blur-sm"
          />
        </div>
        
        {/* Category Filter */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "whitespace-nowrap rounded-xl px-5 py-2 text-sm font-semibold transition-all",
                selectedCategory === cat.id
                  ? "gradient-primary shadow-lg shadow-primary/30 text-primary-foreground"
                  : "glass-card text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Favorites */}
      {quickAddDrinks.length > 0 && searchQuery === "" && selectedCategory === "all" && (
        <div className="relative z-10 px-4 py-3">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Star className="h-3 w-3 text-primary" /> Favorites
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {quickAddDrinks.map((drinkName) => {
              const template = allDrinks.find((d) => d.name === drinkName)
              if (!template) return null
              return (
                <button
                  key={drinkName}
                  onClick={() => handleSelectTemplate(template)}
                  className="glass-card flex flex-shrink-0 items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md shadow-primary/20">
                    <Coffee className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold text-foreground">{drinkName}</span>
                    <span className="text-xs text-muted-foreground">{template.caffeineMg}mg</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Drink List */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 p-4">
          {filteredDrinks.length === 0 ? (
            <div className="py-12 text-center">
              <Coffee className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No drinks found</p>
            </div>
          ) : (
            filteredDrinks.map((template, index) => {
              const Icon = categoryIcons[template.category]
              const isFavorite = quickAddDrinks.includes(template.name)
              return (
                <Card
                  key={template.name}
                  className="glass-card cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleSelectTemplate(template)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
                      index % 2 === 0 ? "gradient-primary shadow-primary/20" : "gradient-accent shadow-accent/20"
                    )}>
                      <Icon className={cn(
                        "h-7 w-7",
                        index % 2 === 0 ? "text-primary-foreground" : "text-accent-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">{template.name}</p>
                        {isFavorite && <Star className="h-4 w-4 fill-primary text-primary" />}
                        {template.isCustom && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">Custom</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.caffeineMg} mg · {template.volumeMl} ml
                      </p>
                    </div>
                    {template.caffeineMg > remaining && (
                      <span className="rounded-lg bg-destructive/20 px-2 py-1 text-xs font-semibold text-destructive">
                        Over
                      </span>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
