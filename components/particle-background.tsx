"use client"

import { useCallback, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Particles from "react-tsparticles"
import { loadSlim } from "tsparticles-slim"
import type { Engine } from "tsparticles-engine"

export function ParticleBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  if (!mounted) return null

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true },
        background: {
          color: theme === "dark" ? "#121212" : "#ffffff",
        },
        particles: {
          number: { value: 80, density: { enable: true, area: 1000 } },
          color: {
            value: theme === "dark" ? ["#00ffcc", "#0077cc"] : ["#0077cc"],
            animation: {
              enable: true,
              speed: 5,
              sync: false,
            },
          },
          links: {
            enable: true,
            distance: 120,
            color: theme === "dark" ? "#00aaff" : "#0077cc",
            opacity: 0.7,
            width: 1.4,
          },
          move: {
            enable: true,
            speed: { min: 0.8, max: 2.5 },
            direction: "none",
            outModes: { default: "out" },
            bounce: true,
            random: true,
            straight: false,
            attract: { enable: true, rotateX: 800, rotateY: 1400 },
          },
          shape: { type: "circle" },
          opacity: {
            value: { min: 0.4, max: 0.9 },
            animation: {
              enable: true,
              speed: 0.7,
              minimumValue: 0.3,
              sync: false,
            },
          },
          size: {
            value: { min: 0.5, max: 1 },
            random: true,
            animation: {
              enable: true,
              speed: 0.6,
              minimumValue: 0.5,
              sync: false,
            },
          },
        },
        interactivity: {
          detect_on: "window",
          events: {
            onHover: { enable: true, mode: ["repulse", "slow", "attract"] },
            onClick: { enable: true, mode: ["push", "explode"] },
          },
          modes: {
            slow: {
              factor: 2.5,
              radius: 180,
            },
            attract: {
              distance: 100,
              duration: 0.4,
              factor: 1.8,
            },
            repulse: {
              distance: 120,
              duration: 1.3,
            },
            push: {
              quantity: 3,
            },
            explode: {
              distance: 250,
              duration: 0.6,
              factor: 4,
            },
          },
        },
        detectRetina: true,
      }}
      className="canvas-3d"
    />
  )
}

