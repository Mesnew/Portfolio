"use client"

import { useEffect, useRef } from "react"
import lottie from "lottie-web"

// Types pour les animations
interface CarLoadingProps {
  duration?: number
  onComplete?: () => void
}

export function CarLoading({ duration = 1500, onComplete }: CarLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Importer dynamiquement les animations
    const loadAnimations = async () => {
      try {
        // Nous utiliserons une seule animation pour simplifier
        // Dans un environnement de production, vous importeriez tous vos fichiers JSON
        const animationData = await import("@/animations/car.json")

        if (containerRef.current) {
          const animationInstance = lottie.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: false,
            autoplay: true,
            animationData: animationData.default,
          })

          // Supprime l'animation après `duration`
          const timeout = setTimeout(() => {
            animationInstance.destroy()
            if (onComplete) onComplete()
          }, duration)

          return () => {
            clearTimeout(timeout)
            animationInstance.destroy()
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'animation:", error)
        if (onComplete) onComplete()
      }
    }

    loadAnimations()
  }, [duration, onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[9999]">
      <div ref={containerRef} className="w-[300px] h-[300px]" />
    </div>
  )
}

