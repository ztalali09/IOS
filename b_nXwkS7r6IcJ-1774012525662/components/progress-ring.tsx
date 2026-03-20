"use client"

import { cn } from "@/lib/utils"

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
}

export function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 16,
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference
  const isOverLimit = progress > 100

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Outer glow */}
      <div 
        className={cn(
          "absolute rounded-full blur-xl transition-all duration-500",
          isOverLimit ? "bg-destructive/30" : "bg-primary/20"
        )}
        style={{ 
          width: size + 20, 
          height: size + 20,
          opacity: progress / 100 * 0.8
        }}
      />
      
      <svg width={size} height={size} className="relative -rotate-90">
        <defs>
          {/* Gradient for progress */}
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.78 0.19 55)" />
            <stop offset="100%" stopColor="oklch(0.65 0.2 35)" />
          </linearGradient>
          <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.55 0.22 25)" />
            <stop offset="100%" stopColor="oklch(0.45 0.2 15)" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle with subtle pattern */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50"
          strokeLinecap="round"
        />
        
        {/* Secondary background ring for depth */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-border/30"
        />
        
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOverLimit ? "url(#dangerGradient)" : "url(#progressGradient)"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="progress-ring-animated"
        />
        
        {/* Highlight dot at the end of progress */}
        {progress > 5 && (
          <circle
            cx={size / 2 + radius * Math.cos((progress / 100) * Math.PI * 2 - Math.PI / 2)}
            cy={size / 2 + radius * Math.sin((progress / 100) * Math.PI * 2 - Math.PI / 2)}
            r={strokeWidth / 2.5}
            fill="white"
            className="opacity-80"
          />
        )}
      </svg>
      
      {/* Center content with glass effect */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="glass-card rounded-full p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
