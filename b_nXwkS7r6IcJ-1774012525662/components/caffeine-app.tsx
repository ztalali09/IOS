"use client"

import { useState, useEffect } from "react"
import { TabBar } from "./tab-bar"
import { Dashboard } from "./dashboard"
import { AddDrink } from "./add-drink"
import { History } from "./history"
import { Stats } from "./stats"
import { Settings } from "./settings"
import { Onboarding } from "./onboarding"
import { useAppStore } from "@/lib/store"

type Tab = "home" | "history" | "stats" | "settings"
type View = "main" | "add-drink"

export function CaffeineApp() {
  const { hasOnboarded, setHasOnboarded, darkMode } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [view, setView] = useState<View>("main")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply dark mode on mount
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Show onboarding if user hasn't completed it
  if (!hasOnboarded) {
    return <Onboarding onComplete={() => setHasOnboarded(true)} />
  }

  // Show add drink screen
  if (view === "add-drink") {
    return <AddDrink onClose={() => setView("main")} />
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      {/* Main content */}
      <main>
        {activeTab === "home" && <Dashboard onAddDrink={() => setView("add-drink")} />}
        {activeTab === "history" && <History />}
        {activeTab === "stats" && <Stats />}
        {activeTab === "settings" && <Settings />}
      </main>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
