"use client"

import { useEffect, useRef } from "react"

export function BackgroundDecoration() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Generate random points
    const points = []
    const numPoints = Math.min(30, Math.floor(window.innerWidth / 50)) // Reduce points on smaller screens

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2, // Slower movement
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1,
      })
    }

    // Draw function with throttling
    let animationFrameId
    let lastDrawTime = 0
    const drawInterval = 1000 / 30 // 30fps

    const draw = (timestamp) => {
      animationFrameId = requestAnimationFrame(draw)

      // Throttle drawing for better performance
      if (timestamp - lastDrawTime < drawInterval) return
      lastDrawTime = timestamp

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update points
      points.forEach((point) => {
        point.x += point.vx
        point.y += point.vy

        // Bounce off edges
        if (point.x < 0 || point.x > window.innerWidth) point.vx *= -1
        if (point.y < 0 || point.y > window.innerHeight) point.vy *= -1
      })

      // Draw lines between points that are close
      ctx.strokeStyle = "rgba(0, 200, 200, 0.1)"
      ctx.lineWidth = 0.5

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x
          const dy = points[i].y - points[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            // Reduced connection distance
            ctx.beginPath()
            ctx.moveTo(points[i].x, points[i].y)
            ctx.lineTo(points[j].x, points[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw points
      ctx.fillStyle = "rgba(0, 200, 200, 0.5)"
      points.forEach((point) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    draw(0)

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-primary/5" />
}

