"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function OrganicBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 30

    // Renderer setup with optimized settings
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Limit pixel ratio
    containerRef.current.appendChild(renderer.domElement)

    // Create metaballs-like effect with marching cubes
    const resolution = 28 // Lower for better performance
    const numBlobs = 8
    const blobsData = []

    // Create blobs data
    for (let i = 0; i < numBlobs; i++) {
      blobsData.push({
        position: new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
        ),
        strength: Math.random() * 0.5 + 0.5,
        radius: Math.random() * 3 + 2,
      })
    }

    // Create marching cubes material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x00ffff) },
        uColorB: { value: new THREE.Color(0x0088ff) },
      },
      vertexShader: `
        uniform float uTime;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normal;
          vPosition = position;
          
          // Add subtle vertex displacement for more organic feel
          vec3 newPosition = position;
          float displacement = sin(position.x * 0.5 + uTime) * sin(position.y * 0.5 + uTime) * sin(position.z * 0.5 + uTime) * 0.15;
          newPosition += normal * displacement;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Calculate fresnel effect for edge glow
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
          fresnel = pow(fresnel, 3.0);
          
          // Create color gradient based on position and time
          float colorMix = sin(vPosition.y * 0.2 + uTime * 0.2) * 0.5 + 0.5;
          vec3 baseColor = mix(uColorA, uColorB, colorMix);
          
          // Add pulsating glow
          float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
          
          // Combine colors with fresnel for edge glow
          vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), fresnel * 0.7 * pulse);
          
          gl_FragColor = vec4(finalColor, 0.85);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    // Function to create metaball mesh
    const createMetaballMesh = () => {
      // Create a sphere for each blob
      const spheres = []
      for (let i = 0; i < numBlobs; i++) {
        const geometry = new THREE.SphereGeometry(blobsData[i].radius, 32, 32)
        const material = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          wireframe: true,
          transparent: true,
          opacity: 0.1,
        })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.copy(blobsData[i].position)
        scene.add(sphere)
        spheres.push(sphere)
      }

      // Create metaball geometry
      const size = 20
      const segments = resolution
      const geometry = new THREE.IcosahedronGeometry(size, segments)

      // Create metaball mesh
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      return { mesh, spheres }
    }

    const { mesh, spheres } = createMetaballMesh()

    // Create organic tendrils
    const createTendrils = () => {
      const tendrilsGroup = new THREE.Group()
      const tendrilCount = 12
      const tendrilsData = []

      for (let i = 0; i < tendrilCount; i++) {
        // Create a curved path for each tendril
        const curvePoints = []
        const segments = 10
        const radius = Math.random() * 5 + 10
        const height = Math.random() * 10 + 5
        const startAngle = Math.random() * Math.PI * 2
        const angleSpan = Math.random() * Math.PI + Math.PI / 2

        for (let j = 0; j <= segments; j++) {
          const t = j / segments
          const angle = startAngle + angleSpan * t
          const x = Math.cos(angle) * radius * (1 - t * 0.5)
          const y = height * (t - 0.5) * 2
          const z = Math.sin(angle) * radius * (1 - t * 0.5)

          curvePoints.push(new THREE.Vector3(x, y, z))
        }

        const curve = new THREE.CatmullRomCurve3(curvePoints)

        // Create tube geometry along the curve
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.2, 8, false)

        // Create material with glow effect
        const tubeMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x00ffff) },
          },
          vertexShader: `
            uniform float uTime;
            
            varying vec2 vUv;
            
            void main() {
              vUv = uv;
              
              // Add subtle movement
              vec3 newPosition = position;
              float displacement = sin(uv.x * 10.0 + uTime) * 0.1;
              newPosition += normal * displacement;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            
            varying vec2 vUv;
            
            void main() {
              // Create pulsating effect
              float pulse = sin(vUv.x * 5.0 + uTime) * 0.5 + 0.5;
              
              // Create gradient along the tendril
              float gradient = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
              
              // Combine effects
              vec3 finalColor = uColor * (gradient + pulse * 0.2);
              float alpha = gradient * 0.7;
              
              gl_FragColor = vec4(finalColor, alpha);
            }
          `,
          transparent: true,
          side: THREE.DoubleSide,
        })

        const tendril = new THREE.Mesh(tubeGeometry, tubeMaterial)

        // Store data for animation
        tendrilsData.push({
          mesh: tendril,
          curve: curve,
          points: curvePoints,
          speed: Math.random() * 0.5 + 0.5,
          phase: Math.random() * Math.PI * 2,
        })

        tendrilsGroup.add(tendril)
      }

      scene.add(tendrilsGroup)

      return { tendrilsGroup, tendrilsData }
    }

    const { tendrilsGroup, tendrilsData } = createTendrils()

    // Create ambient particles
    const createAmbientParticles = () => {
      const particleCount = 200
      const particleGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const sizes = new Float32Array(particleCount)

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // Position particles in a sphere
        const radius = Math.random() * 20 + 10
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i3 + 2] = radius * Math.cos(phi)

        // Random sizes
        sizes[i] = Math.random() * 0.5 + 0.1
      }

      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uPixelRatio;
          
          attribute float size;
          
          void main() {
            // Add subtle movement
            vec3 newPosition = position;
            float angle = uTime * 0.1 + position.x * 0.01 + position.y * 0.01 + position.z * 0.01;
            newPosition.x += sin(angle) * 0.3;
            newPosition.y += cos(angle) * 0.3;
            newPosition.z += sin(angle * 0.7) * 0.3;
            
            vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
            
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          }
        `,
        fragmentShader: `
          void main() {
            // Create circular particles with soft edges
            float distanceToCenter = length(gl_PointCoord - 0.5);
            float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
            
            vec3 color = vec3(0.0, 0.8, 1.0);
            
            gl_FragColor = vec4(color, strength * 0.5);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)

      return particles
    }

    const ambientParticles = createAmbientParticles()

    // Mouse interaction
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    }

    const handleMouseMove = (event: MouseEvent) => {
      // Convert mouse position to normalized device coordinates (-1 to +1)
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Handle touch events for mobile
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.targetX = (event.touches[0].clientX / window.innerWidth) * 2 - 1
        mouse.targetY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
      }
    }

    window.addEventListener("touchmove", handleTouchMove)

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

      if (ambientParticles.material instanceof THREE.ShaderMaterial) {
        ambientParticles.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5)
      }
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Update material uniforms
      material.uniforms.uTime.value = elapsedTime

      // Update tendril materials
      tendrilsData.forEach((tendril) => {
        if (tendril.mesh.material instanceof THREE.ShaderMaterial) {
          tendril.mesh.material.uniforms.uTime.value = elapsedTime
        }
      })

      // Update ambient particles
      if (ambientParticles.material instanceof THREE.ShaderMaterial) {
        ambientParticles.material.uniforms.uTime.value = elapsedTime
      }

      // Animate metaball blobs
      for (let i = 0; i < numBlobs; i++) {
        // Update position
        blobsData[i].position.add(blobsData[i].velocity)

        // Bounce off boundaries
        const bounds = 15
        if (Math.abs(blobsData[i].position.x) > bounds) {
          blobsData[i].velocity.x *= -1
        }
        if (Math.abs(blobsData[i].position.y) > bounds) {
          blobsData[i].velocity.y *= -1
        }
        if (Math.abs(blobsData[i].position.z) > bounds) {
          blobsData[i].velocity.z *= -1
        }

        // Update sphere positions
        spheres[i].position.copy(blobsData[i].position)
      }

      // Animate tendrils
      tendrilsData.forEach((tendril, index) => {
        const points = tendril.points

        for (let i = 0; i < points.length; i++) {
          const t = i / (points.length - 1)
          const waveX = Math.sin(t * 5 + elapsedTime * tendril.speed + tendril.phase) * (1 - t) * 0.5
          const waveY = Math.cos(t * 5 + elapsedTime * tendril.speed + tendril.phase) * (1 - t) * 0.5

          points[i].x += (waveX - points[i].x) * 0.05
          points[i].z += (waveY - points[i].z) * 0.05
        }

        // Update curve and geometry
        tendril.curve.points = points
        tendril.mesh.geometry.dispose()
        tendril.mesh.geometry = new THREE.TubeGeometry(tendril.curve, 20, 0.2, 8, false)
      })

      // Smooth mouse movement
      mouse.x += (mouse.targetX - mouse.x) * 0.1
      mouse.y += (mouse.targetY - mouse.y) * 0.1

      // Move camera based on mouse
      camera.position.x = mouse.x * 10
      camera.position.y = mouse.y * 5
      camera.lookAt(0, 0, 0)

      // Rotate entire scene slightly
      scene.rotation.y = elapsedTime * 0.05

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
      material.dispose()
      mesh.geometry.dispose()

      spheres.forEach((sphere) => {
        sphere.geometry.dispose()
        sphere.material.dispose()
      })

      tendrilsData.forEach((tendril) => {
        tendril.mesh.geometry.dispose()
        if (tendril.mesh.material instanceof THREE.ShaderMaterial) {
          tendril.mesh.material.dispose()
        }
      })

      ambientParticles.geometry.dispose()
      if (ambientParticles.material instanceof THREE.ShaderMaterial) {
        ambientParticles.material.dispose()
      }

      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-primary/5" />
}

