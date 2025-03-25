"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { useRouter } from "next/navigation"

// Définition des planètes et leurs propriétés
interface Planet {
  name: string
  radius: number
  distance: number
  rotationSpeed: number
  orbitSpeed: number
  color: string
  path: string
  texture?: string
  rings?: boolean
  moons?: { distance: number; radius: number; color: string }[]
}

export function SolarSystem3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const controlsRef = useRef<OrbitControls | null>(null)
  const planetsRef = useRef<THREE.Mesh[]>([])
  const planetsDataRef = useRef<Planet[]>([])
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const [followingPlanet, setFollowingPlanet] = useState<THREE.Mesh | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Configuration des planètes
    const planets: Planet[] = [
      {
        name: "CV",
        radius: 0.8,
        distance: 10,
        rotationSpeed: 0.01,
        orbitSpeed: 0.005,
        color: "#4dabf7", // Bleu plus vif
        path: "/cv",
      },
      {
        name: "Réalisations",
        radius: 1.2,
        distance: 16,
        rotationSpeed: 0.008,
        orbitSpeed: 0.003,
        color: "#fa5252", // Rouge plus vif
        path: "/realisations",
      },
      {
        name: "Veille",
        radius: 1.0,
        distance: 22,
        rotationSpeed: 0.012,
        orbitSpeed: 0.002,
        color: "#51cf66", // Vert plus vif
        path: "/veille",
        rings: true,
      },
      {
        name: "Contact",
        radius: 0.9,
        distance: 28,
        rotationSpeed: 0.009,
        orbitSpeed: 0.001,
        color: "#cc5de8", // Violet plus vif
        path: "/contact",
      },
      {
        name: "Test",
        radius: 0.7,
        distance: 34,
        rotationSpeed: 0.015,
        orbitSpeed: 0.0008,
        color: "#fcc419", // Jaune plus vif
        path: "/test",
      },
    ]

    planetsDataRef.current = planets

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 30, 40)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    containerRef.current.appendChild(renderer.domElement)

    // Configuration du post-processing pour l'effet de bloom
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // Ajouter un effet de bloom pour rendre les objets lumineux plus brillants
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // strength
      0.4, // radius
      0.85, // threshold
    )
    composer.addPass(bloomPass)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 5
    controls.maxDistance = 500
    controls.maxPolarAngle = Math.PI // Permettre une rotation verticale complète
    controls.minPolarAngle = 0.1 // Éviter de passer sous le plan
    controls.autoRotate = false
    controls.enableRotate = true
    controls.rotateSpeed = 1.2 // Augmenter la vitesse de rotation
    controls.enableZoom = true
    controls.zoomSpeed = 1.2
    controls.enablePan = true
    controls.panSpeed = 1.2 // Augmenter la vitesse de déplacement latéral
    controls.screenSpacePanning = true // Déplacement plus intuitif
    controlsRef.current = controls

    // Ajouter des contrôles clavier pour se déplacer dans la direction de la caméra
    const keysPressed = { w: false, a: false, s: false, d: false, q: false, e: false }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key in keysPressed) {
        keysPressed[key as keyof typeof keysPressed] = true
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key in keysPressed) {
        keysPressed[key as keyof typeof keysPressed] = false
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    // Ajouter cette fonction après la création des contrôles
    // Fonction pour se déplacer vers une planète
    const focusOnPlanet = (planetMesh: THREE.Mesh) => {
      if (!controlsRef.current) return

      const planetPosition = new THREE.Vector3()
      planetMesh.getWorldPosition(planetPosition)

      // Calculer la position cible de la caméra
      const distance = planetMesh.userData.radius * 5 + 5
      const offset = new THREE.Vector3(distance, distance / 2, distance)

      // Animation de déplacement
      const startPosition = camera.position.clone()
      const targetPosition = planetPosition.clone().add(offset)
      const duration = 1.5 // secondes
      const startTime = clock.getElapsedTime()

      const animateCamera = () => {
        const currentTime = clock.getElapsedTime()
        const elapsed = currentTime - startTime

        if (elapsed < duration) {
          const t = elapsed / duration
          const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easing

          camera.position.lerpVectors(startPosition, targetPosition, easeT)
          controls.target.lerp(planetPosition, easeT)

          requestAnimationFrame(animateCamera)
        } else {
          camera.position.copy(targetPosition)
          controls.target.copy(planetPosition)
        }
      }

      animateCamera()
    }

    // Starfield background
    const createStarfield = () => {
      const starCount = 2000
      const starGeometry = new THREE.BufferGeometry()
      const starPositions = new Float32Array(starCount * 3)
      const starSizes = new Float32Array(starCount)
      const starColors = new Float32Array(starCount * 3)

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3
        // Position stars in a sphere around the scene
        const radius = Math.random() * 500 + 100
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)

        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
        starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        starPositions[i3 + 2] = radius * Math.cos(phi)

        // Random star sizes
        starSizes[i] = Math.random() * 1.5 + 0.5

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
            
            // Twinkling effect
            float twinkle = sin(uTime * 0.5 + position.x * 0.1 + position.y * 0.1 + position.z * 0.1) * 0.5 + 0.5;
            
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

    // Create sun
    const createSun = () => {
      const sunGeometry = new THREE.SphereGeometry(5, 32, 32)
      // Utiliser MeshStandardMaterial au lieu de MeshBasicMaterial pour avoir accès à emissive
      const sunMaterial = new THREE.MeshStandardMaterial({
        color: 0xffdd00,
        emissive: 0xff8800,
        emissiveIntensity: 1,
        roughness: 0.7,
        metalness: 0.3,
      })

      const sun = new THREE.Mesh(sunGeometry, sunMaterial)
      scene.add(sun)

      // Add sun glow
      const glowGeometry = new THREE.SphereGeometry(5.5, 32, 32)
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          glowColor: { value: new THREE.Color(0xff8800) },
        },
        vertexShader: `
          uniform float uTime;
          
          varying vec3 vNormal;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 glowColor;
          
          varying vec3 vNormal;
          
          void main() {
            float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
            
            // Pulsating glow
            float pulse = sin(uTime * 0.5) * 0.1 + 0.9;
            
            gl_FragColor = vec4(glowColor, intensity * pulse);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })

      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.scale.set(1.5, 1.5, 1.5)
      scene.add(glow)

      return { sun, sunMaterial, glow, glowMaterial }
    }

    const { sun, sunMaterial, glow, glowMaterial } = createSun()

    // Create orbit lines
    const createOrbitLines = () => {
      const orbitLines: THREE.Line[] = []

      planets.forEach((planet) => {
        const orbitGeometry = new THREE.BufferGeometry()
        const orbitMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(planet.color).multiplyScalar(0.5), // Utiliser la couleur de la planète
          transparent: true,
          opacity: 0.4, // Augmenter légèrement l'opacité
        })

        const vertices = []
        const segments = 128
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2
          vertices.push(planet.distance * Math.cos(theta), 0, planet.distance * Math.sin(theta))
        }

        orbitGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial)
        scene.add(orbit)
        orbitLines.push(orbit)
      })

      return orbitLines
    }

    const orbitLines = createOrbitLines()

    // Create planets
    const createPlanets = () => {
      const planetMeshes: THREE.Mesh[] = []

      planets.forEach((planet, index) => {
        // Create planet with improved materials
        const planetGeometry = new THREE.SphereGeometry(planet.radius, 32, 32)

        // Utiliser MeshPhongMaterial pour plus de brillance
        const planetMaterial = new THREE.MeshPhongMaterial({
          color: planet.color,
          shininess: 30,
          specular: new THREE.Color(0x333333),
          emissive: new THREE.Color(planet.color).multiplyScalar(0.2), // Ajouter une émission légère
        })

        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial)

        // Position planet on its orbit
        const angle = Math.random() * Math.PI * 2
        planetMesh.position.x = planet.distance * Math.cos(angle)
        planetMesh.position.z = planet.distance * Math.sin(angle)

        // Add planet to scene
        scene.add(planetMesh)
        planetMeshes.push(planetMesh)

        // Add rings if needed with improved visibility
        if (planet.rings) {
          const ringGeometry = new THREE.RingGeometry(planet.radius * 1.5, planet.radius * 2.2, 64)
          const ringMaterial = new THREE.MeshPhongMaterial({
            color: planet.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7, // Augmenter l'opacité
            emissive: new THREE.Color(planet.color).multiplyScalar(0.3), // Ajouter une émission
          })

          const ring = new THREE.Mesh(ringGeometry, ringMaterial)
          ring.rotation.x = Math.PI / 2
          planetMesh.add(ring)
        }

        // Add moons if needed with improved visibility
        if (planet.moons) {
          planet.moons.forEach((moon) => {
            const moonGeometry = new THREE.SphereGeometry(moon.radius, 16, 16)
            const moonMaterial = new THREE.MeshPhongMaterial({
              color: moon.color,
              shininess: 20,
              emissive: new THREE.Color(moon.color).multiplyScalar(0.2),
            })

            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial)
            moonMesh.position.x = moon.distance

            planetMesh.add(moonMesh)
          })
        }

        // Ajouter un effet de halo lumineux autour de la planète
        const glowGeometry = new THREE.SphereGeometry(planet.radius * 1.2, 32, 32)
        const glowMaterial = new THREE.ShaderMaterial({
          uniforms: {
            c: { value: 0.2 },
            p: { value: 3.0 },
            glowColor: { value: new THREE.Color(planet.color) },
          },
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 glowColor;
            uniform float c;
            uniform float p;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
              gl_FragColor = vec4(glowColor, intensity * 0.5);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          depthWrite: false,
        })

        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        planetMesh.add(glow)

        // Store initial position for animation
        planetMesh.userData = {
          orbitAngle: angle,
          orbitSpeed: planet.orbitSpeed,
          rotationSpeed: planet.rotationSpeed,
          name: planet.name,
          path: planet.path,
          radius: planet.radius,
        }
      })

      return planetMeshes
    }

    const planetMeshes = createPlanets()
    planetsRef.current = planetMeshes

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x555555) // Augmenter l'intensité
    scene.add(ambientLight)

    // Add point light at sun position
    const sunLight = new THREE.PointLight(0xffffff, 3, 100) // Augmenter l'intensité
    scene.add(sunLight)

    // Ajouter une lumière hémisphérique pour un éclairage plus naturel
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
    scene.add(hemisphereLight)

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current) return

      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

      // Mettre à jour la taille du composer
      composer.setSize(window.innerWidth, window.innerHeight)

      if (starMaterial.uniforms) {
        starMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5)
      }
    }

    window.addEventListener("resize", handleResize)

    // Handle mouse move for raycasting
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1

      // Update tooltip position
      setTooltipPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Modifier le gestionnaire de clic pour utiliser la fonction focusOnPlanet
    // Remplacer le gestionnaire de clic existant par celui-ci:
    let lastClickTime = 0

    const handleClick = () => {
      if (!cameraRef.current || !sceneRef.current) return

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      const intersects = raycasterRef.current.intersectObjects(planetsRef.current, false)

      if (intersects.length > 0) {
        const planet = intersects[0].object
        if (planet.userData && planet.userData.path) {
          // Double-clic pour naviguer vers la page
          if (Date.now() - lastClickTime < 300) {
            router.push(planet.userData.path)
          } else {
            // Simple clic pour suivre la planète
            console.log("Suivre la planète:", planet.userData.name)

            // Désactiver immédiatement les contrôles
            if (controlsRef.current) {
              controlsRef.current.enabled = false
            }

            // Définir la planète à suivre
            setFollowingPlanet(planet)
          }
          lastClickTime = Date.now()
        }
      } else {
        // Clic en dehors d'une planète - arrêter le suivi
        console.log("Arrêter de suivre")
        setFollowingPlanet(null)

        // Réactiver les contrôles de la caméra
        if (controlsRef.current) {
          controlsRef.current.enabled = true
        }
      }
    }

    window.addEventListener("click", handleClick)

    // Animation loop
    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Update sun shader
      if (sunMaterial.uniforms) {
        sunMaterial.uniforms.uTime.value = elapsedTime
      }

      // Update glow shader
      if (glowMaterial.uniforms) {
        glowMaterial.uniforms.uTime.value = elapsedTime
      }

      // Update star shader
      if (starMaterial.uniforms) {
        starMaterial.uniforms.uTime.value = elapsedTime
      }

      // Rotate and orbit planets
      planetMeshes.forEach((planet) => {
        // Rotate planet
        planet.rotation.y += planet.userData.rotationSpeed

        // Orbit around sun
        planet.userData.orbitAngle += planet.userData.orbitSpeed
        const orbitRadius = planetsDataRef.current.find((p) => p.name === planet.userData.name)?.distance || 10

        planet.position.x = orbitRadius * Math.cos(planet.userData.orbitAngle)
        planet.position.z = orbitRadius * Math.sin(planet.userData.orbitAngle)
      })

      // Suivre la planète sélectionnée
      if (followingPlanet && cameraRef.current && controlsRef.current) {
        // Obtenir la position actuelle de la planète
        const planetPosition = new THREE.Vector3()
        followingPlanet.getWorldPosition(planetPosition)

        // Calculer l'angle de la planète dans son orbite
        const angle = followingPlanet.userData.orbitAngle

        // Calculer la distance de suivi basée sur le rayon de la planète
        const radius = followingPlanet.userData.radius || 1
        const distance = radius * 5 + 3

        // Calculer la position idéale de la caméra pour suivre la planète
        // Positionner la caméra derrière la planète dans son orbite
        const targetCameraPosition = new THREE.Vector3(
          planetPosition.x - Math.cos(angle) * distance,
          planetPosition.y + distance * 0.5, // Légèrement au-dessus
          planetPosition.z - Math.sin(angle) * distance,
        )

        // Déplacer la caméra vers cette position
        cameraRef.current.position.lerp(targetCameraPosition, 0.05)

        // Faire regarder la caméra directement vers la planète
        controlsRef.current.target.copy(planetPosition)

        // Mettre à jour les contrôles
        controlsRef.current.update()

        // Désactiver explicitement les contrôles à chaque frame pendant le suivi
        controlsRef.current.enabled = false
      }

      // Check for planet hover
      if (cameraRef.current && sceneRef.current) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
        const intersects = raycasterRef.current.intersectObjects(planetsRef.current)

        if (intersects.length > 0) {
          const planet = intersects[0].object
          setHoveredPlanet(planet.userData.name)
          document.body.style.cursor = "pointer"
        } else {
          setHoveredPlanet(null)
          document.body.style.cursor = "default"
        }
      }

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update()
      }

      // Gestion des déplacements clavier
      if (controlsRef.current && cameraRef.current) {
        const moveSpeed = 0.5
        const camera = cameraRef.current

        // Calculer la direction avant/arrière (basée sur où pointe la caméra)
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
        forward.y = 0 // Restreindre le mouvement vertical pour les touches W/S
        forward.normalize().multiplyScalar(moveSpeed)

        // Calculer la direction gauche/droite
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
        right.y = 0 // Restreindre le mouvement vertical pour les touches A/D
        right.normalize().multiplyScalar(moveSpeed)

        // Appliquer les mouvements
        if (keysPressed.w) camera.position.add(forward)
        if (keysPressed.s) camera.position.sub(forward)
        if (keysPressed.a) camera.position.sub(right)
        if (keysPressed.d) camera.position.add(right)
        if (keysPressed.q) camera.position.y -= moveSpeed
        if (keysPressed.e) camera.position.y += moveSpeed
      }

      // Utiliser le composer au lieu du renderer
      composer.render()
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }

      // Dispose resources
      stars.geometry.dispose()
      if (starMaterial instanceof THREE.ShaderMaterial) {
        starMaterial.dispose()
      }

      sun.geometry.dispose()
      if (sunMaterial instanceof THREE.Material) {
        sunMaterial.dispose()
      }

      glow.geometry.dispose()
      if (glowMaterial instanceof THREE.ShaderMaterial) {
        glowMaterial.dispose()
      }

      orbitLines.forEach((line) => {
        line.geometry.dispose()
        if (line.material instanceof THREE.Material) {
          line.material.dispose()
        }
      })

      planetMeshes.forEach((planet) => {
        planet.geometry.dispose()
        if (planet.material instanceof THREE.Material) {
          planet.material.dispose()
        }
      })

      renderer.dispose()
      composer.dispose() // Nettoyer le composer
    }
  }, [router])

  return (
    <>
      <div ref={containerRef} className="fixed top-0 left-0 w-full h-full -z-10" />
      {hoveredPlanet && (
        <div
          className="fixed pointer-events-none z-50 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            transform: "translateZ(0)",
          }}
        >
          {hoveredPlanet}
        </div>
      )}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white/80 bg-black/50 px-4 py-2 rounded-full text-sm backdrop-blur-sm z-10">
        <p>Cliquez sur une planète pour la suivre • Double-cliquez pour naviguer</p>
        <p className="text-xs mt-1">Cliquez ailleurs pour arrêter de suivre</p>
        <p className="text-xs mt-1">Souris: Rotation (clic gauche) • Zoom (molette) • Déplacement (clic droit)</p>
      </div>
    </>
  )
}

