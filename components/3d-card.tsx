"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"

interface ThreeDCardProps {
  children: ReactNode
  className?: string
  glareColor?: string
  depth?: number
  onClick?: () => void
}

export function ThreeDCard({
  children,
  className = "",
  glareColor = "rgba(255, 255, 255, 0.1)",
  depth = 20,
  onClick,
}: ThreeDCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()

    // Calculer la position relative de la souris dans la carte (de -0.5 à 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    // Calculer l'angle de rotation (limité à ±15 degrés)
    setRotate({
      x: -y * 15,
      y: x * 15,
    })

    // Positionner l'effet de brillance
    setGlarePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotate({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden transition-transform duration-200 ${className}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.05, 1.05, 1.05)`
          : "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)",
        transition: "transform 0.2s ease-out",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}

      {/* Effet de brillance */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}px ${glarePosition.y}px, ${glareColor} 0%, transparent 70%)`,
            opacity: 0.7,
          }}
        />
      )}

      {/* Effet d'ombre 3D */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: isHovered ? `0 ${depth}px ${depth * 1.5}px rgba(0, 0, 0, 0.2)` : "0 5px 15px rgba(0, 0, 0, 0.1)",
          transition: "box-shadow 0.2s ease-out",
        }}
      />
    </div>
  )
}

