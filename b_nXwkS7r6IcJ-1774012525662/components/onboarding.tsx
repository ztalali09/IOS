"use client"

import { useState } from "react"
import { Coffee, Moon, BarChart3, Zap, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OnboardingProps {
  onComplete: () => void
}

const slides = [
  {
    icon: Coffee,
    title: "Track Your Caffeine",
    description: "Log every cup of coffee, tea, or energy drink to stay on top of your daily intake.",
    gradient: "from-primary to-accent",
  },
  {
    icon: BarChart3,
    title: "Understand Your Habits",
    description: "View detailed statistics, weekly trends, and insights about your caffeine consumption.",
    gradient: "from-accent to-orange-600",
  },
  {
    icon: Moon,
    title: "Better Sleep",
    description: "Get smart recommendations on when to stop drinking caffeine for quality sleep.",
    gradient: "from-amber-600 to-yellow-500",
  },
  {
    icon: Zap,
    title: "Stay Energized",
    description: "Track active caffeine in your body and optimize your intake throughout the day.",
    gradient: "from-yellow-500 to-primary",
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon
  const isLastSlide = currentSlide === slides.length - 1

  return (
    <div className="gradient-bg flex min-h-screen flex-col">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />
      </div>

      {/* Skip button */}
      <div className="relative z-10 flex justify-end p-4">
        <Button variant="ghost" onClick={onComplete} className="text-muted-foreground hover:text-foreground">
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex max-w-sm flex-col items-center text-center">
          {/* Animated Icon Container */}
          <div className="relative mb-10">
            {/* Glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br opacity-50 blur-xl transition-all duration-700",
              slide.gradient
            )} />
            
            {/* Icon background */}
            <div className={cn(
              "relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br shadow-2xl transition-all duration-500",
              slide.gradient
            )}>
              <div className="absolute inset-1 rounded-full bg-background/20 backdrop-blur-sm" />
              <Icon className="relative h-16 w-16 text-white drop-shadow-lg" />
            </div>
            
            {/* Floating sparkles */}
            <Sparkles className="absolute -right-2 -top-2 h-6 w-6 animate-pulse text-primary" />
            <Sparkles className="absolute -bottom-1 -left-3 h-5 w-5 animate-pulse text-accent delay-300" />
          </div>

          {/* Title */}
          <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight">
            <span className="text-gradient">{slide.title}</span>
          </h1>

          {/* Description */}
          <p className="mb-10 text-pretty text-lg leading-relaxed text-muted-foreground">
            {slide.description}
          </p>

          {/* Progress dots */}
          <div className="mb-8 flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  currentSlide === index
                    ? "w-8 gradient-primary shadow-lg shadow-primary/30"
                    : "w-2.5 bg-muted hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex items-center justify-between p-6 pb-10">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className={cn(
            "h-14 w-14 rounded-full border border-border/50 backdrop-blur-sm transition-all hover:bg-card/50",
            currentSlide === 0 && "invisible"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          onClick={handleNext}
          size="lg"
          className={cn(
            "h-14 rounded-2xl gradient-primary px-10 text-lg font-semibold shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 active:scale-95",
            isLastSlide && "px-16"
          )}
        >
          {isLastSlide ? (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started
            </>
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        {!isLastSlide && (
          <div className="w-14" /> 
        )}
      </div>
    </div>
  )
}
