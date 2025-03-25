"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function OptimizedBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 15

    // Renderer setup with optimized settings
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: false,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Limit pixel ratio
    containerRef.current.appendChild(renderer.domElement)

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = Math.min(1500, Math.floor((window.innerWidth * window.innerHeight) / 2000))

    const posArray = new Float32Array(particlesCount * 3)
    const colorArray = new Float32Array(particlesCount * 3)
    const sizeArray = new Float32Array(particlesCount)

    // Fill positions and colors
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Positions - create a sphere of particles
      const radius = 10 + Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      posArray[i] = radius * Math.sin(phi) * Math.cos(theta)
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      posArray[i + 2] = radius * Math.cos(phi)

      // Colors - teal/cyan theme
      colorArray[i] = 0
      colorArray[i + 1] = 0.8 + Math.random() * 0.2
      colorArray[i + 2] = 0.8 + Math.random() * 0.2

      // Sizes
      sizeArray[i / 3] = Math.random() * 2 + 0.5
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3))
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizeArray, 1))

    // Custom shader material for better performance
    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        
        attribute float size;
        attribute vec3 color;
        
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          
          // Simple rotation
          float angle = uTime * 0.1;
          mat3 rotationMatrix = mat3(
            cos(angle), 0.0, sin(angle),
            0.0, 1.0, 0.0,
            -sin(angle), 0.0, cos(angle)
          );
          
          vec3 rotatedPosition = rotationMatrix * position;
          
          vec4 mvPosition = modelViewMatrix * vec4(rotatedPosition, 1.0);
          
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * uPixelRatio * (1.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Create circular points with soft edges
          float distanceToCenter = length(gl_PointCoord - 0.5);
          float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          
          gl_FragColor = vec4(vColor, strength);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Create connecting lines
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x00c8c8,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    })

    const linesGroup = new THREE.Group()
    scene.add(linesGroup)

    // Function to update lines
    const updateLines = () => {
      // Clear previous lines
      while (linesGroup.children.length > 0) {
        const line = linesGroup.children[0]
        line.geometry.dispose()
        linesGroup.remove(line)
      }

      // Create new lines between close particles
      const positions = particlesGeometry.attributes.position.array
      const maxLines = 300 // Limit number of lines for performance
      let lineCount = 0

      for (let i = 0; i < particlesCount; i++) {
        if (lineCount >= maxLines) break

        const ix = i * 3
        const x1 = positions[ix]
        const y1 = positions[ix + 1]
        const z1 = positions[ix + 2]

        for (let j = i + 1; j < particlesCount; j++) {
          if (lineCount >= maxLines) break

          const jx = j * 3
          const x2 = positions[jx]
          const y2 = positions[jx + 1]
          const z2 = positions[jx + 2]

          const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2))

          if (distance < 3) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(x1, y1, z1),
              new THREE.Vector3(x2, y2, z2),
            ])

            const line = new THREE.Line(lineGeometry, linesMaterial)
            linesGroup.add(line)
            lineCount++
          }
        }
      }
    }

    // Initial line creation
    updateLines()

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

    // Handle touch events for mobile
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
      }
    }

    window.addEventListener("touchmove", handleTouchMove)

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      particlesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop with frame limiting
    const clock = new THREE.Clock()
    let lastUpdateTime = 0
    const updateInterval = 1000 / 30 // Target 30fps for line updates

    const animate = () => {
      requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      particlesMaterial.uniforms.uTime.value = elapsedTime

      // Update camera position based on mouse
      camera.position.x = mouse.x * 3
      camera.position.y = mouse.y * 3
      camera.lookAt(scene.position)

      // Rotate particle system
      particlesMesh.rotation.y = elapsedTime * 0.05

      // Update lines periodically for better performance
      if (elapsedTime - lastUpdateTime > updateInterval / 1000) {
        updateLines()
        lastUpdateTime = elapsedTime
      }

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("resize", handleResize)

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }

      // Dispose resources
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      linesMaterial.dispose()

      linesGroup.children.forEach((line) => {
        if (line.geometry) line.geometry.dispose()
      })

      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-primary/5" />
}

