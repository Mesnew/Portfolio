"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"

export function EnhancedBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

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
      stencil: false,
      depth: false,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Limit pixel ratio for better  0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Limit pixel ratio for better performance
    containerRef.current.appendChild(renderer.domElement)

    // Custom post-processing shader for chromatic aberration and vignette
    // Simplified to reduce performance impact
    const customShader = {
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        distortion: { value: 0.01 }, // Reduced distortion
        vignetteIntensity: { value: 0.8 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float distortion;
        uniform float vignetteIntensity;
        
        varying vec2 vUv;
        
        void main() {
          vec2 p = vUv;
          
          // Simplified chromatic aberration
          float d = length(p - 0.5);
          float aberration = d * distortion;
          
          vec2 offset = vec2(aberration, 0.0);
          
          vec4 cr = texture2D(tDiffuse, p + offset * 0.1);
          vec4 cg = texture2D(tDiffuse, p);
          vec4 cb = texture2D(tDiffuse, p - offset * 0.1);
          
          // Simplified vignette effect
          float vignette = smoothstep(0.8, 0.1, length(p - 0.5)) * vignetteIntensity;
          
          vec4 color = vec4(cr.r, cg.g, cb.b, 1.0);
          color.rgb = mix(color.rgb, color.rgb * vignette, 0.5);
          
          gl_FragColor = color;
        }
      `,
    }

    // Post-processing with reduced quality for better performance
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // Reduced strength
      0.4, // radius
      0.85, // threshold
    )
    composer.addPass(bloomPass)

    const customPass = new ShaderPass(customShader)
    composer.addPass(customPass)

    // Create wave terrain with reduced complexity
    const waveGeometry = new THREE.PlaneGeometry(80, 80, 64, 64) // Reduced resolution

    // Simplified shader material for the waves
    const waveMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x00ffff) },
        uColorB: { value: new THREE.Color(0x0088ff) },
        uColorC: { value: new THREE.Color(0x00aaff) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uIntensity: { value: 0.0 }, // For animation
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uIntensity;
        
        varying vec2 vUv;
        varying float vElevation;
        
        // Simplex 3D Noise (simplified)
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          // First corner
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          // Permutations
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
          // Gradients
          float n_ = 1.0/7.0;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          // Normalise gradients
          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          // Mix final noise value
          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }
        
        float getElevation(vec3 position) {
          float elevation = 0.0;
          
          // Simplified noise calculation for better performance
          float noiseScale = 0.2;
          elevation += snoise(vec3(position.x * noiseScale, position.y * noiseScale, uTime * 0.1)) * 2.0;
          
          // Medium detail
          noiseScale = 0.4;
          elevation += snoise(vec3(position.x * noiseScale, position.y * noiseScale, uTime * 0.15)) * 1.0;
          
          // Mouse interaction
          float mouseDistance = distance(position.xy, uMouse * 40.0);
          float mouseInfluence = 1.0 - smoothstep(0.0, 15.0, mouseDistance);
          elevation += mouseInfluence * 3.0 * uIntensity;
          
          return elevation;
        }
        
        void main() {
          vUv = uv;
          
          vec3 newPosition = position;
          float elevation = getElevation(newPosition);
          newPosition.z = elevation;
          
          vElevation = elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        uniform float uTime;
        
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          // Dynamic color mixing based on elevation and time
          float mixStrength = (vElevation + 2.0) * 0.25;
          
          // Pulsating effect
          float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
          
          // Create color bands
          vec3 color;
          if (mixStrength < 0.33) {
            float t = mixStrength / 0.33;
            color = mix(uColorA, uColorB, t);
          } else if (mixStrength < 0.66) {
            float t = (mixStrength - 0.33) / 0.33;
            color = mix(uColorB, uColorC, t);
          } else {
            float t = (mixStrength - 0.66) / 0.34;
            color = mix(uColorC, uColorA, t);
          }
          
          // Add glow at peaks
          float glowIntensity = smoothstep(0.6, 1.0, mixStrength);
          color += glowIntensity * 0.5 * pulse;
          
          gl_FragColor = vec4(color, 0.7 + glowIntensity * 0.2);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const waves = new THREE.Mesh(waveGeometry, waveMaterial)
    waves.rotation.x = -Math.PI / 2
    waves.position.y = -5
    scene.add(waves)

    // Reduced number of floating particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 1500 // Reduced count

    const positions = new Float32Array(particlesCount * 3)
    const scales = new Float32Array(particlesCount)
    const opacities = new Float32Array(particlesCount)

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3

      // Position particles in a 3D space above the waves
      positions[i3] = (Math.random() - 0.5) * 80
      positions[i3 + 1] = Math.random() * 25 - 5
      positions[i3 + 2] = (Math.random() - 0.5) * 80

      // Random scales for varied particle sizes
      scales[i] = Math.random() * 0.2 + 0.05

      // Random opacity for depth effect
      opacities[i] = Math.random() * 0.5 + 0.5
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1))
    particlesGeometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1))

    // Simplified shader for particles
    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
        uSize: { value: 150 }, // Reduced size
        uIntensity: { value: 0.0 }, // For animation
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uSize;
        uniform float uIntensity;
        
        attribute float aScale;
        attribute float aOpacity;
        
        varying float vOpacity;
        
        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          // Add some movement to particles
          float angle = uTime * 0.2 + modelPosition.x * 0.02 + modelPosition.z * 0.02;
          modelPosition.y += sin(angle) * 0.5 * uIntensity;
          modelPosition.x += cos(angle) * 0.3 * uIntensity;
          
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectedPosition;
          
          // Size attenuation
          gl_PointSize = uSize * aScale * uPixelRatio;
          gl_PointSize *= (1.0 / - viewPosition.z);
          
          vOpacity = aOpacity * uIntensity;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        
        void main() {
          // Create circular particles with soft edges
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          
          // Add some texture to the particles
          strength *= smoothstep(0.0, 0.5, 1.0 - distanceToCenter * 2.0);
          
          vec3 color = mix(vec3(0.0, 0.8, 1.0), vec3(0.5, 0.8, 1.0), strength);
          
          gl_FragColor = vec4(color, strength * vOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Add light rays
    // const lightRayGeometry = new THREE.CylinderGeometry(0, 0.2, 10, 6, 1, true)

    // const lightRayMaterial = new THREE.ShaderMaterial({
    //   uniforms: {
    //     uTime: { value: 0 },
    //     uColor: { value: new THREE.Color(0x00ffff) },
    //     uIntensity: { value: 0.0 }, // For animation
    //   },
    //   vertexShader: `
    //     uniform float uTime;

    //     varying vec2 vUv;

    //     void main() {
    //       vUv = uv;

    //       vec3 newPosition = position;

    //       gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    //     }
    //   `,
    //   fragmentShader: `
    //     uniform vec3 uColor;
    //     uniform float uTime;
    //     uniform float uIntensity;

    //     varying vec2 vUv;

    //     void main() {
    //       // Create light ray effect
    //       float strength = 1.0 - vUv.y;
    //       strength = pow(strength, 2.0);

    //       // Add pulsating effect
    //       float pulse = sin(uTime * 0.5 + vUv.y * 5.0) * 0.5 + 0.5;
    //       strength *= pulse * uIntensity;

    //       // Add some noise
    //       float noise = fract(sin(vUv.y * 100.0 + uTime) * 1000.0);
    //       strength *= 1.0 - noise * 0.1;

    //       vec3 color = uColor * strength;

    //       gl_FragColor = vec4(color, strength * 0.3);
    //     }
    //   `,
    //   transparent: true,
    //   side: THREE.DoubleSide,
    //   blending: THREE.AdditiveBlending,
    //   depthWrite: false,
    // })

    // const lightRays = []
    // const lightRayCount = 8

    // for (let i = 0; i < lightRayCount; i++) {
    //   const lightRay = new THREE.Mesh(lightRayGeometry, lightRayMaterial.clone())

    //   // Position
    //   const angle = (i / lightRayCount) * Math.PI * 2
    //   const radius = 15
    //   lightRay.position.set(Math.cos(angle) * radius, 10, Math.sin(angle) * radius)

    //   // Rotation - point toward center
    //   lightRay.lookAt(0, 0, 0)
    //   lightRay.rotateX(Math.PI / 2)

    //   // Scale
    //   const scaleY = Math.random() * 2 + 3
    //   lightRay.scale.set(1, scaleY, 1)

    //   scene.add(lightRay)
    //   lightRays.push(lightRay)
    // }

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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

      // Update composer
      composer.setSize(window.innerWidth, window.innerHeight)

      // Update uniforms
      waveMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
      particlesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const clock = new THREE.Clock()
    let intensity = 0

    // Start animation
    setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    // Use requestAnimationFrame with throttling for better performance
    let lastTime = 0
    const frameRate = 30 // Target 30fps instead of 60fps for better performance
    const interval = 1000 / frameRate

    const animate = (currentTime: number) => {
      requestAnimationFrame(animate)

      // Throttle rendering for better performance
      if (currentTime - lastTime < interval) return
      lastTime = currentTime

      const elapsedTime = clock.getElapsedTime()

      // Gradually increase intensity for smooth intro animation
      if (isLoaded && intensity < 1) {
        intensity += 0.01
      }

      // Update uniforms
      waveMaterial.uniforms.uTime.value = elapsedTime
      waveMaterial.uniforms.uIntensity.value = intensity
      particlesMaterial.uniforms.uTime.value = elapsedTime
      particlesMaterial.uniforms.uIntensity.value = intensity
      customPass.uniforms.time.value = elapsedTime

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

      // Render
      composer.render()
    }

    animate(0)

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
  }, [isLoaded])

  return <div ref={containerRef} className="absolute top-0 left-0 w-full h-full -z-10" />
}

