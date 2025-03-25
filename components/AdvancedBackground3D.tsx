"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"

export function AdvancedBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 20
    camera.position.y = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)

    // Post-processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // strength
      0.4, // radius
      0.85, // threshold
    )
    composer.addPass(bloomPass)

    // Create wave terrain
    const waveGeometry = new THREE.PlaneGeometry(60, 60, 128, 128)

    // Custom shader material for the waves
    const waveMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x00ffff) },
        uColorB: { value: new THREE.Color(0x0088ff) },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        
        varying vec2 vUv;
        varying float vElevation;
        
        float getElevation(vec2 position) {
          float elevation = 0.0;
          
          // Base waves
          elevation += sin(position.x * 0.5 + uTime * 0.5) * 0.5;
          elevation += sin(position.y * 0.5 + uTime * 0.5) * 0.5;
          
          // Smaller detail waves
          elevation += sin(position.x * 2.0 + uTime * 0.75) * 0.25;
          elevation += sin(position.y * 2.0 + uTime * 0.75) * 0.25;
          
          // Mouse interaction
          float mouseDistance = distance(position, uMouse * 30.0);
          float mouseInfluence = 1.0 - smoothstep(0.0, 15.0, mouseDistance);
          elevation += mouseInfluence * 2.0;
          
          return elevation;
        }
        
        void main() {
          vUv = uv;
          
          vec3 newPosition = position;
          float elevation = getElevation(newPosition.xy);
          newPosition.z = elevation;
          
          vElevation = elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          float mixStrength = (vElevation + 1.0) * 0.5;
          vec3 color = mix(uColorA, uColorB, mixStrength);
          
          // Add glow at peaks
          float glowIntensity = smoothstep(0.6, 1.0, mixStrength);
          color += glowIntensity * 0.5;
          
          gl_FragColor = vec4(color, 0.7);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const waves = new THREE.Mesh(waveGeometry, waveMaterial)
    waves.rotation.x = -Math.PI / 2
    waves.position.y = -5
    scene.add(waves)

    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 2000

    const positions = new Float32Array(particlesCount * 3)
    const scales = new Float32Array(particlesCount)

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3

      // Position particles in a 3D space above the waves
      positions[i3] = (Math.random() - 0.5) * 60
      positions[i3 + 1] = Math.random() * 20 - 5
      positions[i3 + 2] = (Math.random() - 0.5) * 60

      // Random scales for varied particle sizes
      scales[i] = Math.random() * 0.2 + 0.05
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1))

    // Custom shader for particles
    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 200 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uSize;
        
        attribute float aScale;
        
        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          // Add some movement to particles
          modelPosition.y += sin(uTime * 0.2 + modelPosition.x * 0.1) * 0.5;
          modelPosition.x += sin(uTime * 0.1 + modelPosition.z * 0.1) * 0.5;
          
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectedPosition;
          gl_PointSize = uSize * aScale * uPixelRatio;
          gl_PointSize *= (1.0 / - viewPosition.z);
        }
      `,
      fragmentShader: `
        void main() {
          // Create circular particles with soft edges
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          
          vec3 color = mix(vec3(0.0, 0.8, 1.0), vec3(0.5, 0.8, 1.0), strength);
          
          gl_FragColor = vec4(color, strength);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Mouse interaction
    const mouse = {
      x: 0,
      y: 0,
      lerpX: 0,
      lerpY: 0,
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
      // Update camera
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      // Update renderer
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // Update composer
      composer.setSize(window.innerWidth, window.innerHeight)

      // Update particle material
      particlesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()

      // Update uniforms
      waveMaterial.uniforms.uTime.value = elapsedTime
      particlesMaterial.uniforms.uTime.value = elapsedTime

      // Smooth mouse movement with lerp
      mouse.lerpX += (mouse.x - mouse.lerpX) * 0.05
      mouse.lerpY += (mouse.y - mouse.lerpY) * 0.05

      // Update wave material with mouse position
      waveMaterial.uniforms.uMouse.value.x = mouse.lerpX
      waveMaterial.uniforms.uMouse.value.y = mouse.lerpY

      // Move camera slightly based on mouse
      camera.position.x = mouse.lerpX * 3
      camera.position.y = 5 + mouse.lerpY * 2
      camera.lookAt(0, 0, 0)

      // Rotate particles slowly
      particles.rotation.y = elapsedTime * 0.05

      // Render
      composer.render()

      requestAnimationFrame(animate)
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
      waveGeometry.dispose()
      waveMaterial.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      renderer.dispose()
      composer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="absolute top-0 left-0 w-full h-full -z-10" />
}

