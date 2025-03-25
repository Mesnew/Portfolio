"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function Background3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 30

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 1500

    const posArray = new Float32Array(particlesCount * 3)
    const colorArray = new Float32Array(particlesCount * 3)

    // Fill positions and colors
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Positions - create a sphere of particles
      const radius = 20 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      posArray[i] = radius * Math.sin(phi) * Math.cos(theta)
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      posArray[i + 2] = radius * Math.cos(phi)

      // Colors - teal/cyan theme
      colorArray[i] = 0
      colorArray[i + 1] = 0.8 + Math.random() * 0.2
      colorArray[i + 2] = 0.8 + Math.random() * 0.2
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3))

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })

    // Create the particle system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Create connecting lines between close particles
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x00c8c8,
      transparent: true,
      opacity: 0.1,
    })

    const linesGeometry = new THREE.BufferGeometry()
    const linesPositions = new Float32Array(particlesCount * 6) // 2 points per line
    linesGeometry.setAttribute("position", new THREE.BufferAttribute(linesPositions, 3))
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial)
    scene.add(linesMesh)

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Mouse interaction
    const mouse = {
      x: 0,
      y: 0,
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate the particle system
      particlesMesh.rotation.x += 0.0005
      particlesMesh.rotation.y += 0.0005

      // Update camera position slightly based on mouse
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02
      camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      // Update connecting lines
      const positions = particlesGeometry.attributes.position.array
      const linePositions = linesGeometry.attributes.position.array
      let lineIndex = 0

      for (let i = 0; i < particlesCount; i++) {
        const ix = i * 3
        const x1 = positions[ix]
        const y1 = positions[ix + 1]
        const z1 = positions[ix + 2]

        for (let j = i + 1; j < particlesCount; j++) {
          const jx = j * 3
          const x2 = positions[jx]
          const y2 = positions[jx + 1]
          const z2 = positions[jx + 2]

          const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2))

          if (distance < 5 && lineIndex < linesPositions.length - 6) {
            linePositions[lineIndex++] = x1
            linePositions[lineIndex++] = y1
            linePositions[lineIndex++] = z1
            linePositions[lineIndex++] = x2
            linePositions[lineIndex++] = y2
            linePositions[lineIndex++] = z2
          }
        }
      }

      // Fill the rest with invisible lines
      while (lineIndex < linesPositions.length) {
        linePositions[lineIndex++] = 0
        linePositions[lineIndex++] = 0
        linePositions[lineIndex++] = 0
      }

      linesGeometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }

      // Dispose resources
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      linesGeometry.dispose()
      linesMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="absolute top-0 left-0 w-full h-full -z-10" />
}

