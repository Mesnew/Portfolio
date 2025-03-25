"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ThreeDCard } from "@/components/3d-card"

interface SectionCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  animationDelay?: number
}

export function SectionCard({ title, description, href, icon, animationDelay = 0 }: SectionCardProps) {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleClick = () => {
    router.push(href)
  }

  const style = {
    opacity: 0,
    transform: "translateY(20px)",
    animation: `fadeIn 0.5s ease-in-out ${animationDelay}s forwards`,
  }

  return (
    <div style={isClient ? style : undefined}>
      <ThreeDCard className="section-card cursor-pointer" onClick={handleClick} glareColor="rgba(0, 119, 204, 0.2)">
        <div className="block h-full">
          <div className="mb-4 transition-transform duration-300 hover:scale-110">{icon}</div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </ThreeDCard>
    </div>
  )
}

