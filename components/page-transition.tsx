"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { PageLoader } from "@/components/page-loader"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [currentChildren, setCurrentChildren] = useState(children)

  // Surveiller les changements de route
  useEffect(() => {
    const url = pathname + searchParams.toString()

    // Fonction pour gérer la transition
    const handleRouteChange = () => {
      setIsLoading(true)

      // Après un délai, mettre à jour les enfants et terminer le chargement
      const timer = setTimeout(() => {
        setCurrentChildren(children)
      }, 100) // Petit délai pour s'assurer que le loader s'affiche

      return () => clearTimeout(timer)
    }

    handleRouteChange()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  return (
    <>
      {isLoading && <PageLoader onComplete={() => setIsLoading(false)} />}
      {currentChildren}
    </>
  )
}

