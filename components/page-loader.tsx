"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { FileIcon, HomeIcon, UserIcon, NewspaperIcon, MailIcon, ArrowRightIcon } from "lucide-react"

interface PageLoaderProps {
  onComplete?: () => void
}

export function PageLoader({ onComplete }: PageLoaderProps) {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)

  // Déterminer l'icône en fonction du chemin
  const getIcon = () => {
    switch (pathname) {
      case "/":
        return <HomeIcon className="h-12 w-12" />
      case "/cv":
        return <UserIcon className="h-12 w-12" />
      case "/realisations":
        return <FileIcon className="h-12 w-12" />
      case "/veille":
        return <NewspaperIcon className="h-12 w-12" />
      case "/contact":
        return <MailIcon className="h-12 w-12" />
      default:
        return <ArrowRightIcon className="h-12 w-12" />
    }
  }

  // Déterminer la couleur en fonction du chemin
  const getColor = () => {
    switch (pathname) {
      case "/":
        return "bg-gradient-to-r from-blue-500 to-cyan-400"
      case "/cv":
        return "bg-gradient-to-r from-purple-500 to-indigo-400"
      case "/realisations":
        return "bg-gradient-to-r from-green-500 to-emerald-400"
      case "/veille":
        return "bg-gradient-to-r from-orange-500 to-amber-400"
      case "/contact":
        return "bg-gradient-to-r from-pink-500 to-rose-400"
      default:
        return "bg-gradient-to-r from-blue-500 to-cyan-400"
    }
  }

  useEffect(() => {
    // Simuler une progression de chargement
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            if (onComplete) onComplete()
          }, 300) // Petit délai avant de terminer
          return 100
        }
        return prev + 5
      })
    }, 50)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-[9999]">
      <div className={`p-6 rounded-full ${getColor()} shadow-lg mb-8 animate-fade-in`}>
        <div className="text-white animate-spin-slow">{getIcon()}</div>
      </div>

      <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-foreground font-medium animate-fade-in">{progress < 100 ? "Chargement..." : "Prêt !"}</p>
    </div>
  )
}

