"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function FluidBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 30
    camera.position.y = 5

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

    // Create a fluid wave surface
    const geometry = new THREE.PlaneGeometry(60, 60, 128, 128)

    // Custom shader material for fluid waves
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseIntensity: { value: 0 },
        uColorA: { value: new THREE.Color(0x00ffff) },
        uColorB: { value: new THREE.Color(0x0088ff) },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uMouseIntensity;
        
        varying vec2 vUv;
        varying float vElevation;
        
        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                           + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          vUv = uv;
          
          // Calculate distance from mouse position
          vec2 centeredUV = vUv * 2.0 - 1.0;
          float distanceToMouse = length(centeredUV - uMouse);
          float mouseEffect = smoothstep(0.5, 0.0, distanceToMouse) * uMouseIntensity;
          
          // Base wave pattern
          float elevation = 0.0;
          
          // Large waves
          float freq = 0.8;
          float amp = 1.0;
          float time = uTime * 0.3;
          
          elevation += snoise(vec2(centeredUV.x * freq + time, centeredUV.y * freq)) * amp;
          
          // Medium waves
          freq = 2.0;
          amp = 0.5;
          time = uTime * 0.4;
          
          elevation += snoise(vec2(centeredUV.x * freq - time, centeredUV.y * freq)) * amp;
          
          // Small waves
          freq = 4.0;
          amp = 0.2;
          time = uTime * 0.5;
          
          elevation += snoise(vec2(centeredUV.x * freq + time * 0.5, centeredUV.y * freq)) * amp;
          
          // Add mouse interaction
          elevation += mouseEffect * 3.0;
          
          // Set vertex position
          vec3 newPosition = position;
          newPosition.z = elevation;
          
          vElevation = elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uTime;
        
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          // Normalize elevation for color mixing
          float mixFactor = (vElevation + 2.0) * 0.25;
          mixFactor = clamp(mixFactor, 0.0, 1.0);
          
          // Add some variation based on time
          mixFactor += sin(uTime * 0.2 + vUv.x * 10.0) * 0.05;
          
          // Mix colors based on elevation
          vec3 color = mix(uColorA, uColorB, mixFactor);
          
          // Add highlights at peaks
          float highlight = smoothstep(0.7, 1.0, mixFactor);
          color += highlight * 0.3;
          
          // Add subtle gradient based on Y position
          color += vec3(0.0, 0.0, 0.1) * vUv.y;
          
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const waves = new THREE.Mesh(geometry, material)
    waves.rotation.x = -Math.PI / 3 // Tilt the waves
    waves.position.y = -5
    scene.add(waves)

    // Add floating geometric shapes
    const shapes = new THREE.Group()
    scene.add(shapes)

    // Create different geometric shapes
    const shapeGeometries = [
      new THREE.IcosahedronGeometry(1, 0), // Low poly icosahedron
      new THREE.TetrahedronGeometry(1, 0), // Tetrahedron
      new THREE.OctahedronGeometry(1, 0), // Octahedron
      new THREE.DodecahedronGeometry(1, 0), // Dodecahedron
    ]

    // Create shape material with glow effect
    const shapeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.7,
    })

    // Create wireframe material
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    })

    // Add shapes to the scene
    const shapeCount = 15
    const shapeData = []

    for (let i = 0; i < shapeCount; i++) {
      // Choose random geometry
      const geometryIndex = Math.floor(Math.random() * shapeGeometries.length)
      const shapeGeometry = shapeGeometries[geometryIndex].clone()

      // Create mesh
      const mesh = new THREE.Mesh(shapeGeometry, shapeMaterial)

      // Create wireframe
      const wireframeGeometry = new THREE.WireframeGeometry(shapeGeometry)
      const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)

      // Set random position
      const x = (Math.random() - 0.5) * 50
      const y = Math.random() * 20 - 5
      const z = (Math.random() - 0.5) * 50

      mesh.position.set(x, y, z)
      wireframe.position.set(x, y, z)

      // Set random rotation
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
      wireframe.rotation.copy(mesh.rotation)

      // Set random scale
      const scale = Math.random() * 0.5 + 0.5
      mesh.scale.set(scale, scale, scale)
      wireframe.scale.set(scale, scale, scale)

      // Add to group
      shapes.add(mesh)
      shapes.add(wireframe)

      // Store data for animation
      shapeData.push({
        mesh,
        wireframe,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2,
      })
    }

    // Mouse interaction
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      intensity: 0,
      targetIntensity: 0,
    }

    const handleMouseMove = (event: MouseEvent) => {
      // Convert mouse position to normalized device coordinates (-1 to +1)
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1
      mouse.targetIntensity = 1.0

      // Reset intensity decay timeout
      clearTimeout(intensityDecayTimeout)
      intensityDecayTimeout = setTimeout(() => {
        mouse.targetIntensity = 0
      }, 2000)
    }

    let intensityDecayTimeout: NodeJS.Timeout

    window.addEventListener("mousemove", handleMouseMove)

    // Handle touch events for mobile
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.targetX = (event.touches[0].clientX / window.innerWidth) * 2 - 1
        mouse.targetY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
        mouse.targetIntensity = 1.0

        // Reset intensity decay timeout
        clearTimeout(intensityDecayTimeout)
        intensityDecayTimeout = setTimeout(() => {
          mouse.targetIntensity = 0
        }, 2000)
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      handleTouchMove(event)
    }

    window.addEventListener("touchmove", handleTouchMove)
    window.addEventListener("touchstart", handleTouchStart)

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Update material uniforms
      material.uniforms.uTime.value = elapsedTime

      // Smooth mouse movement
      mouse.x += (mouse.targetX - mouse.x) * 0.1
      mouse.y += (mouse.targetY - mouse.y) * 0.1
      mouse.intensity += (mouse.targetIntensity - mouse.intensity) * 0.05

      material.uniforms.uMouse.value.set(mouse.x, mouse.y)
      material.uniforms.uMouseIntensity.value = mouse.intensity

      // Animate shapes
      shapeData.forEach((data) => {
        // Rotate shapes
        data.mesh.rotation.x += data.rotationSpeed.x
        data.mesh.rotation.y += data.rotationSpeed.y
        data.mesh.rotation.z += data.rotationSpeed.z

        data.wireframe.rotation.copy(data.mesh.rotation)

        // Float up and down
        const floatY = Math.sin(elapsedTime * data.floatSpeed + data.floatOffset) * 0.5
        data.mesh.position.y += (floatY - data.mesh.position.y) * 0.01
        data.wireframe.position.y = data.mesh.position.y
      })

      // Move camera slightly based on mouse
      camera.position.x = mouse.x * 5
      camera.position.y = 5 + mouse.y * 2
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("resize", handleResize)
      clearTimeout(intensityDecayTimeout)

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }

      // Dispose resources
      geometry.dispose()
      material.dispose()
      shapeMaterial.dispose()
      wireframeMaterial.dispose()

      shapeGeometries.forEach((geo) => geo.dispose())

      shapeData.forEach((data) => {
        data.mesh.geometry.dispose()
        data.wireframe.geometry.dispose()
      })

      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-primary/5" />
}

