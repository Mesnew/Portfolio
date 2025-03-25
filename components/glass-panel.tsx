import type React from "react"
interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  intensity?: "light" | "medium" | "heavy"
}

export function GlassPanel({ children, className = "", intensity = "medium" }: GlassPanelProps) {
  // Définir l'intensité de l'effet verre
  const getIntensityStyles = () => {
    switch (intensity) {
      case "light":
        return "bg-white/30 dark:bg-black/20 backdrop-blur-sm"
      case "heavy":
        return "bg-white/60 dark:bg-black/60 backdrop-blur-xl"
      case "medium":
      default:
        return "bg-white/40 dark:bg-black/40 backdrop-blur-md"
    }
  }

  return (
    <div
      className={`rounded-xl border border-white/20 dark:border-white/10 shadow-lg ${getIntensityStyles()} ${className}`}
    >
      {children}
    </div>
  )
}

