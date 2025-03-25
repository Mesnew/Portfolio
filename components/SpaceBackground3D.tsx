"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"

export function SpaceBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    camera.position.z = 50
    camera.position.y = 10

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    containerRef.current.appendChild(renderer.domElement)

    // Configuration du post-processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // Bloom effect pour les éléments lumineux
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7, // strength
      0.4, // radius
      0.85, // threshold
    )
    composer.addPass(bloomPass)

    // Shader personnalisé pour la distorsion gravitationnelle
    const gravitationalLensShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uBlackHolePosition: { value: new THREE.Vector3(0, 0, 0) },
        uDistortionStrength: { value: 0.3 },
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
        uniform float uTime;
        uniform vec3 uBlackHolePosition;
        uniform float uDistortionStrength;
        
        varying vec2 vUv;
        
        void main() {
          // Convert UV to clip space (-1 to 1)
          vec2 centeredUV = vUv * 2.0 - 1.0;
          
          // Position of black hole in clip space (center of screen)
          vec2 blackHolePos = vec2(0.0, 0.0);
          
          // Distance to black hole
          float dist = length(centeredUV - blackHolePos);
          
          // Calculate distortion factor (stronger closer to black hole)
          // Improved formula for more realistic gravitational lensing
          float distortionFactor = 1.0 / pow(max(dist, 0.1), 2.0) * uDistortionStrength;
          
          // Direction from current point to black hole
          vec2 dir = normalize(blackHolePos - centeredUV);
          
          // Apply distortion - pull UVs toward black hole
          // Add subtle time-based variation for a more dynamic effect
          float timeVariation = sin(uTime * 0.2) * 0.05 + 1.0;
          vec2 distortedUV = centeredUV + dir * distortionFactor * distortionFactor * timeVariation;
          
          // Convert back to UV space (0 to 1)
          distortedUV = distortedUV * 0.5 + 0.5;
          
          // Sample the texture with distorted UVs
          vec4 color = texture2D(tDiffuse, distortedUV);
          
          // Add subtle blue glow near the black hole
          if (dist < 0.3) {
            float glowIntensity = (0.3 - dist) / 0.3 * 0.2;
            color.rgb += vec3(0.0, 0.1, 0.3) * glowIntensity;
          }
          
          // Add subtle chromatic aberration near the black hole
          if (dist < 0.5) {
            float chromaticStrength = (0.5 - dist) / 0.5 * 0.03;
            vec2 redOffset = distortedUV + dir * chromaticStrength;
            vec2 blueOffset = distortedUV - dir * chromaticStrength;
            
            // Keep red and blue offsets within bounds
            redOffset = clamp(redOffset, 0.0, 1.0);
            blueOffset = clamp(blueOffset, 0.0, 1.0);
            
            color.r = mix(color.r, texture2D(tDiffuse, redOffset).r, 0.5);
            color.b = mix(color.b, texture2D(tDiffuse, blueOffset).b, 0.5);
          }
          
          gl_FragColor = color;
        }
      `,
    }

    const lensDistortionPass = new ShaderPass(gravitationalLensShader)
    composer.addPass(lensDistortionPass)

    // Create starfield
    const createStarfield = () => {
      const starCount = 2000
      const starGeometry = new THREE.BufferGeometry()
      const starPositions = new Float32Array(starCount * 3)
      const starSizes = new Float32Array(starCount)
      const starColors = new Float32Array(starCount * 3)

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3
        // Position stars in a sphere around the camera
        const radius = Math.random() * 1000 + 200
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)

        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
        starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        starPositions[i3 + 2] = radius * Math.cos(phi)

        // Random star sizes
        starSizes[i] = Math.random() * 2 + 0.5

        // Star colors (mostly white/blue with some variation)
        const colorChoice = Math.random()
        if (colorChoice > 0.9) {
          // Red/orange stars
          starColors[i3] = 0.8 + Math.random() * 0.2
          starColors[i3 + 1] = 0.3 + Math.random() * 0.3
          starColors[i3 + 2] = 0.2
        } else if (colorChoice > 0.8) {
          // Yellow stars
          starColors[i3] = 0.8 + Math.random() * 0.2
          starColors[i3 + 1] = 0.8 + Math.random() * 0.2
          starColors[i3 + 2] = 0.3
        } else if (colorChoice > 0.6) {
          // Blue stars
          starColors[i3] = 0.3 + Math.random() * 0.2
          starColors[i3 + 1] = 0.5 + Math.random() * 0.2
          starColors[i3 + 2] = 0.8 + Math.random() * 0.2
        } else {
          // White/blue-ish stars
          starColors[i3] = 0.7 + Math.random() * 0.3
          starColors[i3 + 1] = 0.7 + Math.random() * 0.3
          starColors[i3 + 2] = 0.9 + Math.random() * 0.1
        }
      }

      starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))
      starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1))
      starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3))

      const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
          uTime: { value: 0 },
        },
        vertexShader: `
          uniform float uPixelRatio;
          uniform float uTime;
          
          attribute float size;
          attribute vec3 color;
          
          varying vec3 vColor;
          
          void main() {
            vColor = color;
            
            // Improved twinkling effect with multiple frequencies
            float twinkle = sin(uTime * 0.5 + position.x * 0.1 + position.y * 0.1 + position.z * 0.1) * 0.5 + 0.5;
            twinkle *= sin(uTime * 0.2 + position.z * 0.05) * 0.25 + 0.75;
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z) * (0.5 + twinkle * 0.5);
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

      const stars = new THREE.Points(starGeometry, starMaterial)
      scene.add(stars)

      return { stars, material: starMaterial }
    }

    const { stars, material: starMaterial } = createStarfield()

    // Créer l'effet de lentille gravitationnelle
    const createBlackHole = () => {
      // Black hole event horizon - improved with more detailed shader
      const blackHoleGeometry = new THREE.SphereGeometry(10, 64, 64)
      const blackHoleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          uniform float uTime;
          
          varying vec3 vPosition;
          varying vec3 vNormal;
          
          void main() {
            vPosition = position;
            vNormal = normal;
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          
          varying vec3 vPosition;
          varying vec3 vNormal;
          
          void main() {
            // Calculate view direction
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            
            // Improved Fresnel effect for more realistic edge glow
            float fresnel = pow(1.0 - dot(vNormal, viewDirection), 8.0);
            
            // Subtle time-based variation
            float timeVariation = sin(uTime * 0.2) * 0.1 + 0.9;
            
            // Create a dark black hole with a subtle blue glow at the edges
            vec3 color = mix(
              vec3(0.0, 0.0, 0.0), 
              vec3(0.0, 0.3, 0.8) * timeVariation, 
              fresnel * 0.7
            );
            
            // Add subtle texture to the black hole
            float noisePattern = fract(sin(dot(vNormal, vec3(12.9898, 78.233, 45.164)) + uTime * 0.1) * 43758.5453);
            color = mix(color, color * (0.9 + noisePattern * 0.1), 0.2);
            
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      })

      const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial)
      scene.add(blackHole)

      // Accretion disk - improved with more detailed and realistic shader
      const diskGeometry = new THREE.RingGeometry(12, 30, 128, 12)
      const diskMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          uniform float uTime;
          
          varying vec2 vUv;
          varying float vElevation;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            vPosition = position;
            
            // Create more complex wave pattern in the disk
            float angle = atan(position.y, position.x);
            float radius = length(position.xy);
            
            // Multiple wave frequencies for more organic look
            float wave1 = sin(angle * 8.0 + uTime * 0.5) * 0.15;
            float wave2 = sin(angle * 16.0 - uTime * 0.3) * 0.05;
            float wave3 = sin(angle * 24.0 + uTime * 0.7) * 0.02;
            
            // Combine waves and apply radial falloff
            float elevation = (wave1 + wave2 + wave3) * (1.0 - (radius - 12.0) / 18.0);
            
            vec3 newPosition = position;
            newPosition.z = elevation;
            vElevation = elevation;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          
          varying vec2 vUv;
          varying float vElevation;
          varying vec3 vPosition;
          
          // Improved noise function
          float hash(vec3 p) {
            p = fract(p * vec3(443.897, 441.423, 437.195));
            p += dot(p, p.yzx + 19.19);
            return fract((p.x + p.y) * p.z);
          }
          
          void main() {
            // Calculate distance from inner edge for gradient
            float distFromInner = vUv.y; // In a ring geometry, v runs from inner to outer radius
            
            // Create more complex swirling patterns
            float angle = atan(vPosition.y, vPosition.x);
            float radius = length(vPosition.xy);
            
            // Multiple swirl frequencies
            float swirl1 = sin(angle * 20.0 + uTime * 2.0 + distFromInner * 10.0) * 0.5 + 0.5;
            float swirl2 = sin(angle * 30.0 - uTime * 1.5 + distFromInner * 15.0) * 0.5 + 0.5;
            float swirl = mix(swirl1, swirl2, 0.5);
            
            // Add noise-based turbulence
            float noise = hash(vec3(vPosition.xy * 0.1, uTime * 0.05));
            swirl = mix(swirl, noise, 0.2);
            
            // Create color gradient from inner (hot) to outer (cooler)
            vec3 innerColor = vec3(1.0, 0.6, 0.0); // Brighter orange/yellow
            vec3 midColor = vec3(0.9, 0.2, 0.6);   // Vibrant purple/pink
            vec3 outerColor = vec3(0.2, 0.4, 0.9); // Bright blue
            
            vec3 color;
            if (distFromInner < 0.3) {
              color = mix(innerColor, midColor, distFromInner / 0.3);
            } else {
              color = mix(midColor, outerColor, (distFromInner - 0.3) / 0.7);
            }
            
            // Add swirl pattern and brightness variation
            color = mix(color * 0.5, color * 1.2, swirl);
            
            // Add glow based on elevation
            color += vec3(0.1, 0.05, 0.2) * (vElevation + 0.2) * 3.0;
            
            // Add hot spots that move around the disk
            float hotSpot1 = smoothstep(0.95, 1.0, sin(angle * 2.0 + uTime * 0.7) * 0.5 + 0.5);
            float hotSpot2 = smoothstep(0.95, 1.0, sin(angle * 3.0 - uTime * 0.5 + 1.5) * 0.5 + 0.5);
            color += vec3(1.0, 0.7, 0.3) * hotSpot1 * 2.0;
            color += vec3(0.9, 0.3, 0.6) * hotSpot2 * 2.0;
            
            // Adjust opacity for a more realistic look - thinner at edges
            float alpha = 0.8 * (1.0 - pow(abs(vUv.y - 0.5) * 2.0, 2.0));
            
            // Add subtle pulsing to the opacity
            alpha *= 0.9 + sin(uTime * 0.3) * 0.1;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const disk = new THREE.Mesh(diskGeometry, diskMaterial)
      disk.rotation.x = Math.PI / 4 // Tilt the disk
      scene.add(disk)

      // Light rays from behind the black hole - improved
      const createLightRays = () => {
        const rayGeometry = new THREE.CylinderGeometry(0, 2, 40, 8, 1, true)
        const rayMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
          },
          vertexShader: `
            uniform float uTime;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uTime;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
              // Create gradient along the ray
              float gradient = 1.0 - vUv.y;
              gradient = pow(gradient, 3.0);
              
              // Add pulsating effect with multiple frequencies
              float pulse1 = sin(uTime * 0.5 + vUv.y * 5.0) * 0.5 + 0.5;
              float pulse2 = sin(uTime * 0.3 + vUv.y * 3.0) * 0.5 + 0.5;
              float pulse = mix(pulse1, pulse2, 0.5);
              
              gradient *= 0.7 + pulse * 0.3;
              
              // Add some variation based on position
              float posVariation = sin(vPosition.x * 0.2 + vPosition.y * 0.1 + uTime * 0.2) * 0.1 + 0.9;
              gradient *= posVariation;
              
              // Blue-ish color with subtle variation
              vec3 baseColor = vec3(0.2, 0.4, 1.0);
              vec3 accentColor = vec3(0.1, 0.6, 0.9);
              vec3 color = mix(baseColor, accentColor, sin(uTime * 0.2) * 0.5 + 0.5) * gradient;
              
              // Add subtle flickering
              float flicker = sin(uTime * 2.0) * 0.05 + 0.95;
              color *= flicker;
              
              gl_FragColor = vec4(color, gradient * 0.4);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })

        const rays = new THREE.Group()

        // Create multiple rays around the black hole
        const rayCount = 12 // Increased from 8
        for (let i = 0; i < rayCount; i++) {
          const ray = new THREE.Mesh(rayGeometry, rayMaterial.clone())

          // Position rays behind the black hole
          const angle = (i / rayCount) * Math.PI * 2
          ray.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, -10)

          // Point away from black hole
          ray.lookAt(0, 0, -50)

          // Random scale and rotation
          const scale = Math.random() * 0.5 + 0.5
          ray.scale.set(scale, 1 + Math.random() * 0.5, scale)
          ray.rotation.z = Math.random() * Math.PI

          rays.add(ray)
        }

        scene.add(rays)
        return { rays, material: rayMaterial }
      }

      const { rays, material: rayMaterial } = createLightRays()

      // Add photon sphere - a ring of light around the black hole
      const photonSphereGeometry = new THREE.TorusGeometry(11, 0.2, 16, 100)
      const photonSphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          uniform float uTime;
          
          varying vec3 vPosition;
          
          void main() {
            vPosition = position;
            
            // Add subtle movement to the photon sphere
            vec3 newPosition = position;
            float angle = atan(position.y, position.x);
            float distortion = sin(angle * 8.0 + uTime) * 0.05;
            
            newPosition.x *= 1.0 + distortion;
            newPosition.y *= 1.0 + distortion;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          
          varying vec3 vPosition;
          
          void main() {
            // Create pulsating bright blue ring
            float pulse = sin(uTime * 2.0) * 0.2 + 0.8;
            
            // Create moving light points along the ring
            float angle = atan(vPosition.y, vPosition.x);
            float lightPoint1 = smoothstep(0.95, 1.0, sin(angle * 20.0 - uTime * 5.0) * 0.5 + 0.5);
            float lightPoint2 = smoothstep(0.95, 1.0, sin(angle * 15.0 + uTime * 7.0) * 0.5 + 0.5);
            
            vec3 baseColor = vec3(0.3, 0.7, 1.0) * pulse;
            vec3 pointColor = vec3(1.0, 1.0, 1.0);
            
            vec3 finalColor = baseColor + pointColor * (lightPoint1 + lightPoint2) * 2.0;
            
            gl_FragColor = vec4(finalColor, 0.8);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const photonSphere = new THREE.Mesh(photonSphereGeometry, photonSphereMaterial)
      photonSphere.rotation.x = Math.PI / 4 // Same tilt as accretion disk
      scene.add(photonSphere)

      return {
        blackHole,
        blackHoleMaterial,
        disk,
        diskMaterial,
        rays,
        rayMaterial,
        photonSphere,
        photonSphereMaterial,
      }
    }

    const { blackHole, blackHoleMaterial, disk, diskMaterial, rays, rayMaterial, photonSphere, photonSphereMaterial } =
      createBlackHole()

    // Créer l'effet de lentille gravitationnelle
    const createMeteors = () => {
      const meteorGroup = new THREE.Group()
      const meteorCount = 30
      const meteorData = []

      // Create asteroid belt around the black hole
      for (let i = 0; i < meteorCount; i++) {
        // Create random shaped meteor
        const meteorGeometry = new THREE.IcosahedronGeometry(Math.random() * 1.5 + 0.5, 0)

        // Distort the geometry to make it look more like an asteroid
        const positions = meteorGeometry.attributes.position.array
        for (let j = 0; j < positions.length; j += 3) {
          positions[j] += (Math.random() - 0.5) * 0.2
          positions[j + 1] += (Math.random() - 0.5) * 0.2
          positions[j + 2] += (Math.random() - 0.5) * 0.2
        }

        // Update normals after distortion
        meteorGeometry.computeVertexNormals()

        // Create material with rocky texture - improved
        const meteorMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
          },
          vertexShader: `
            uniform float uTime;
            
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            void main() {
              vPosition = position;
              vNormal = normal;
              
              // Add subtle movement to the meteor
              vec3 newPosition = position;
              newPosition += normal * sin(uTime + position.x * 5.0) * 0.02;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uTime;
            
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            // Improved noise function
            float noise(vec3 p) {
              vec3 i = floor(p);
              vec3 f = fract(p);
              f = f * f * (3.0 - 2.0 * f);
              
              float n = i.x + i.y * 157.0 + 113.0 * i.z;
              return mix(
                mix(
                  mix(fract(sin(n + 0.0) * 43758.5453), fract(sin(n + 1.0) * 43758.5453), f.x),
                  mix(fract(sin(n + 157.0) * 43758.5453), fract(sin(n + 158.0) * 43758.5453), f.x),
                  f.y
                ),
                mix(
                  mix(fract(sin(n + 113.0) * 43758.5453), fract(sin(n + 114.0) * 43758.5453), f.x),
                  mix(fract(sin(n + 270.0) * 43758.5453), fract(sin(n + 271.0) * 43758.5453), f.x),
                  f.y
                ),
                f.z
              );
            }
            
            void main() {
              // Create rocky texture with improved noise
              float rockPattern1 = noise(vPosition * 10.0);
              float rockPattern2 = noise(vPosition * 20.0 + vec3(100.0));
              float rockPattern = mix(rockPattern1, rockPattern2, 0.5);
              
              // Create craters
              float crater1 = smoothstep(0.4, 0.5, length(vPosition - vec3(0.5, 0.5, 0.0)));
              float crater2 = smoothstep(0.3, 0.4, length(vPosition - vec3(-0.3, 0.2, 0.4)));
              float craters = min(crater1, crater2);
              
              // Base color (gray/brown) with more variation
              vec3 rockColor1 = vec3(0.4, 0.3, 0.2); // Brown
              vec3 rockColor2 = vec3(0.6, 0.6, 0.6); // Gray
              vec3 rockColor3 = vec3(0.5, 0.4, 0.3); // Tan
              
              vec3 rockColor = mix(
                mix(rockColor1, rockColor2, rockPattern),
                rockColor3,
                noise(vPosition * 5.0 + uTime * 0.1)
              );
              
              // Add some variation based on normal
              float normalVariation = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
              rockColor = mix(rockColor * 0.7, rockColor, normalVariation);
              
              // Darken craters
              rockColor = mix(rockColor, rockColor * 0.6, 1.0 - craters);
              
              gl_FragColor = vec4(rockColor, 1.0);
            }
          `,
        })

        const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial)

        // Position in an elliptical orbit around the black hole
        const orbitRadius = Math.random() * 30 + 35
        const orbitEccentricity = Math.random() * 0.3
        const angle = Math.random() * Math.PI * 2

        meteor.position.x = orbitRadius * (1 + orbitEccentricity) * Math.cos(angle)
        meteor.position.z = orbitRadius * (1 - orbitEccentricity) * Math.sin(angle)
        meteor.position.y = (Math.random() - 0.5) * 20

        // Random rotation
        meteor.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)

        // Store data for animation
        meteorData.push({
          mesh: meteor,
          orbitRadius,
          orbitEccentricity,
          orbitAngle: angle,
          orbitSpeed: Math.random() * 0.008 + 0.003, // Reduced speed
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01,
          },
          material: meteorMaterial,
        })

        meteorGroup.add(meteor)
      }

      scene.add(meteorGroup)

      return { meteorGroup, meteorData }
    }

    const { meteorGroup, meteorData } = createMeteors()

    // Créer l'effet de lentille gravitationnelle
    const createSpaceDust = () => {
      const particleCount = 800
      const particleGeometry = new THREE.BufferGeometry()
      const particlePositions = new Float32Array(particleCount * 3)
      const particleSizes = new Float32Array(particleCount)
      const particleColors = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // Position particles in a torus around the black hole
        const radius = Math.random() * 15 + 15
        const angle = Math.random() * Math.PI * 2
        const height = (Math.random() - 0.5) * 10

        particlePositions[i3] = radius * Math.cos(angle)
        particlePositions[i3 + 1] = height
        particlePositions[i3 + 2] = radius * Math.sin(angle)

        // Random sizes
        particleSizes[i] = Math.random() * 0.5 + 0.1

        // Varied colors for more interesting dust
        const colorChoice = Math.random()
        if (colorChoice > 0.7) {
          // Blue-ish
          particleColors[i3] = 0.4 + Math.random() * 0.2
          particleColors[i3 + 1] = 0.6 + Math.random() * 0.2
          particleColors[i3 + 2] = 0.8 + Math.random() * 0.2
        } else if (colorChoice > 0.4) {
          // Cyan-ish
          particleColors[i3] = 0.3 + Math.random() * 0.2
          particleColors[i3 + 1] = 0.7 + Math.random() * 0.3
          particleColors[i3 + 2] = 0.7 + Math.random() * 0.3
        } else {
          // Purple-ish
          particleColors[i3] = 0.5 + Math.random() * 0.3
          particleColors[i3 + 1] = 0.3 + Math.random() * 0.2
          particleColors[i3 + 2] = 0.7 + Math.random() * 0.3
        }
      }

      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
      particleGeometry.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1))
      particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3))

      const particleMaterial = new THREE.ShaderMaterial({
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
            
            // Add more complex swirling motion
            vec3 newPosition = position;
            
            float angle = uTime * 0.1;
            float radius = length(position.xz);
            float newAngle = atan(position.z, position.x) + angle * (1.0 - radius / 30.0);
            
            // Add some radial pulsation
            float radialPulse = sin(radius * 0.2 - uTime * 0.3) * 0.05 + 1.0;
            
            newPosition.x = radius * cos(newAngle) * radialPulse;
            newPosition.z = radius * sin(newAngle) * radialPulse;
            
            // Add some vertical oscillation with multiple frequencies
            newPosition.y += sin(uTime * 0.2 + radius * 0.2) * 0.3;
            newPosition.y += cos(uTime * 0.3 + newAngle * 2.0) * 0.2;
            
            vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * uPixelRatio * (100.0 / -mvPosition.z);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            // Create circular particles with soft edges
            float distanceToCenter = length(gl_PointCoord - 0.5);
            float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
            
            gl_FragColor = vec4(vColor, strength * 0.4);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)

      return { particles, material: particleMaterial }
    }

    const { particles, material: particleMaterial } = createSpaceDust()

    // Mouse interaction
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    }

    const handleMouseMove = (event: MouseEvent) => {
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

      // Update composer size
      composer.setSize(window.innerWidth, window.innerHeight)

      if (starMaterial.uniforms) {
        starMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5)
      }

      if (particleMaterial.uniforms) {
        particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5)
      }
    }

    window.addEventListener("resize", handleResize)

    // Animation loop with performance optimization
    const clock = new THREE.Clock()
    let lastTime = 0
    const frameInterval = 1000 / 60 // Target 60 FPS

    const animate = (currentTime: number) => {
      requestAnimationFrame(animate)

      // Throttle rendering for consistent performance
      if (currentTime - lastTime < frameInterval) return
      lastTime = currentTime

      const elapsedTime = clock.getElapsedTime()

      // Update all shader uniforms
      if (starMaterial.uniforms) {
        starMaterial.uniforms.uTime.value = elapsedTime
      }

      if (blackHoleMaterial.uniforms) {
        blackHoleMaterial.uniforms.uTime.value = elapsedTime
      }

      if (diskMaterial.uniforms) {
        diskMaterial.uniforms.uTime.value = elapsedTime
      }

      if (particleMaterial.uniforms) {
        particleMaterial.uniforms.uTime.value = elapsedTime
      }

      if (photonSphereMaterial.uniforms) {
        photonSphereMaterial.uniforms.uTime.value = elapsedTime
      }

      // Update ray materials
      rays.children.forEach((ray) => {
        if (ray.material instanceof THREE.ShaderMaterial && ray.material.uniforms) {
          ray.material.uniforms.uTime.value = elapsedTime
        }
      })

      // Rotate the accretion disk
      disk.rotation.z = elapsedTime * 0.1

      // Update meteors
      meteorData.forEach((meteor) => {
        // Update orbit position
        meteor.orbitAngle += meteor.orbitSpeed

        const orbitRadius = meteor.orbitRadius
        const eccentricity = meteor.orbitEccentricity

        meteor.mesh.position.x =
          orbitRadius * (1 + eccentricity * Math.cos(meteor.orbitAngle)) * Math.cos(meteor.orbitAngle)
        meteor.mesh.position.z =
          orbitRadius * (1 + eccentricity * Math.cos(meteor.orbitAngle)) * Math.sin(meteor.orbitAngle)

        // Rotate meteor
        meteor.mesh.rotation.x += meteor.rotationSpeed.x
        meteor.mesh.rotation.y += meteor.rotationSpeed.y
        meteor.mesh.rotation.z += meteor.rotationSpeed.z

        // Update shader uniforms
        if (meteor.material.uniforms) {
          meteor.material.uniforms.uTime.value = elapsedTime
        }
      })

      // Smooth mouse movement
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      // Move camera based on mouse
      camera.position.x = mouse.x * 20
      camera.position.y = 10 + mouse.y * 10
      camera.lookAt(0, 0, 0)

      // Update lens distortion shader
      if (lensDistortionPass.uniforms) {
        lensDistortionPass.uniforms.uTime.value = elapsedTime
      }

      // Render with post-processing
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
      stars.geometry.dispose()
      if (starMaterial instanceof THREE.ShaderMaterial) {
        starMaterial.dispose()
      }

      blackHole.geometry.dispose()
      blackHoleMaterial.dispose()

      disk.geometry.dispose()
      diskMaterial.dispose()

      photonSphere.geometry.dispose()
      photonSphereMaterial.dispose()

      rays.children.forEach((ray) => {
        if (ray instanceof THREE.Mesh) {
          ray.geometry.dispose()
          ray.material.dispose()
        }
      })

      meteorData.forEach((meteor) => {
        meteor.mesh.geometry.dispose()
        meteor.material.dispose()
      })

      particles.geometry.dispose()
      particleMaterial.dispose()

      renderer.dispose()
      composer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full -z-10" />
}

