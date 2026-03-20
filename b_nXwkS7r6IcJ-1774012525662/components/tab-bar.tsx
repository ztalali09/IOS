"use client"

import { Home, Clock, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "home" | "history" | "stats" | "settings"

interface TabBarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "history", label: "History", icon: Clock },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-glass-border">
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-2 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-5 py-2 transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator background */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-primary/10" />
              )}
              
              {/* Icon container */}
              <div className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                isActive && "gradient-primary shadow-lg shadow-primary/30"
              )}>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-primary-foreground scale-110" : ""
                  )}
                />
              </div>
              
              <span className={cn(
                "relative text-xs font-medium transition-all duration-300",
                isActive && "text-primary font-semibold"
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
