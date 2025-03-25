"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

// Définition des planètes et leurs propriétés
interface Planet {
  name: string
  solarName: string // Nom du système solaire
  radius: number
  distance: number
  rotationSpeed: number
  orbitSpeed: number
  color: string
  path: string
  description: string
  diameter: string
  distanceFromSun: string
  orbitalPeriod: string
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
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const animationRef = useRef<number | null>(null)
  const initialCameraPositionRef = useRef<THREE.Vector3 | null>(null)
  const initialControlsTargetRef = useRef<THREE.Vector3 | null>(null)
  // Stocker les vitesses orbitales originales des planètes
  const originalOrbitSpeedsRef = useRef<Map<THREE.Mesh, number>>(new Map())

  useEffect(() => {
    if (!containerRef.current) return

    // Configuration des planètes
    const planets: Planet[] = [
      {
        name: "CV",
        solarName: "Mercure",
        radius: 0.8,
        distance: 10,
        rotationSpeed: 0.01,
        orbitSpeed: 0.005,
        color: "#c0c0c0", // Gris argenté
        path: "/cv",
        description:
          "La planète la plus proche du Soleil, caractérisée par des températures extrêmes et une surface criblée de cratères.",
        diameter: "4 880 km",
        distanceFromSun: "57,9 millions km",
        orbitalPeriod: "88 jours",
      },
      {
        name: "Réalisations",
        solarName: "Vénus",
        radius: 1.2,
        distance: 16,
        rotationSpeed: 0.008,
        orbitSpeed: 0.003,
        color: "#e39e54", // Jaune-orangé
        path: "/realisations",
        description:
          "Souvent appelée la jumelle de la Terre en raison de sa taille similaire, mais avec une atmosphère dense et toxique.",
        diameter: "12 104 km",
        distanceFromSun: "108,2 millions km",
        orbitalPeriod: "225 jours",
      },
      {
        name: "Veille",
        solarName: "Terre",
        radius: 1.0,
        distance: 22,
        rotationSpeed: 0.012,
        orbitSpeed: 0.002,
        color: "#4dabf7", // Bleu
        path: "/veille",
        description:
          "Notre planète, la seule connue à abriter la vie, avec ses océans d'eau liquide et son atmosphère riche en oxygène.",
        diameter: "12 756 km",
        distanceFromSun: "149,6 millions km",
        orbitalPeriod: "365,25 jours",
      },
      {
        name: "Contact",
        solarName: "Mars",
        radius: 0.9,
        distance: 28,
        rotationSpeed: 0.009,
        orbitSpeed: 0.001,
        color: "#fa5252", // Rouge
        path: "/contact",
        description:
          "La planète rouge, avec ses calottes polaires et ses vallées asséchées, pourrait avoir abrité la vie dans le passé.",
        diameter: "6 792 km",
        distanceFromSun: "227,9 millions km",
        orbitalPeriod: "687 jours",
      },
      {
        name: "Test",
        solarName: "Jupiter",
        radius: 1.8,
        distance: 34,
        rotationSpeed: 0.015,
        orbitSpeed: 0.0008,
        color: "#fcc419", // Jaune-brun
        path: "/test",
        description:
          "La plus grande planète du système solaire, une géante gazeuse avec sa Grande Tache Rouge et ses nombreuses lunes.",
        diameter: "142 984 km",
        distanceFromSun: "778,5 millions km",
        orbitalPeriod: "11,86 ans",
        rings: true,
      },
      {
        name: "Autre",
        solarName: "Saturne",
        radius: 1.6,
        distance: 42,
        rotationSpeed: 0.01,
        orbitSpeed: 0.0006,
        color: "#e9d8a6", // Beige-doré
        path: "/test",
        description:
          "Célèbre pour ses magnifiques anneaux, cette géante gazeuse possède également un système complexe de lunes.",
        diameter: "120 536 km",
        distanceFromSun: "1,4 milliard km",
        orbitalPeriod: "29,46 ans",
        rings: true,
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
    initialCameraPositionRef.current = camera.position.clone()

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

    // Modifier les paramètres des contrôles pour améliorer la rotation avec la souris
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.minDistance = 10
    controls.maxDistance = 200
    controls.maxPolarAngle = Math.PI // Permettre une rotation verticale complète
    controls.minPolarAngle = 0 // Permettre de passer au-dessus et en-dessous
    controls.autoRotate = false
    controls.enableRotate = true
    controls.rotateSpeed = 0.5 // Réduire légèrement pour plus de précision
    controls.enableZoom = true
    controls.zoomSpeed = 1.0
    controls.enablePan = true
    controls.panSpeed = 0.8
    controls.screenSpacePanning = true
    controls.target.set(0, 0, 0) // Cibler le centre du soleil
    initialControlsTargetRef.current = controls.target.clone()
    controlsRef.current = controls

    // Ajouter des contrôles clavier pour se déplacer dans la direction de la caméra
    // const keysPressed = { w: false, a: false, s: false, d: false, q: false, e: false }
    // Ajouter des contrôles clavier pour se déplacer dans la direction de la caméra (configuration AZERTY)
    const keysPressed = { z: false, q: false, s: false, d: false, a: false, e: false }

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
          solarName: planet.solarName,
          path: planet.path,
          radius: planet.radius,
          planetData: planet, // Stocker toutes les données de la planète
        }

        // Stocker la vitesse orbitale originale
        originalOrbitSpeedsRef.current.set(planetMesh, planet.orbitSpeed)
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

    // Fonction pour faire un zoom sur une planète et arrêter son mouvement orbital
    const zoomToPlanet = (planet: THREE.Mesh) => {
      if (!cameraRef.current || !controlsRef.current) return

      // Annuler toute animation en cours
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }

      // Désactiver les contrôles pendant l'animation
      controlsRef.current.enabled = false

      // Obtenir la position de la planète
      const planetPosition = new THREE.Vector3()
      planet.getWorldPosition(planetPosition)

      // Calculer la distance de zoom basée sur le rayon de la planète
      const radius = planet.userData.radius || 1
      const zoomDistance = radius * 3 // Distance plus proche pour un gros plan

      // Calculer la position de la caméra pour le gros plan
      // Nous voulons être légèrement décalés pour voir la planète sous un angle intéressant
      const offset = new THREE.Vector3(zoomDistance * 0.7, zoomDistance * 0.5, zoomDistance * 0.7)

      // Position cible de la caméra
      const targetPosition = planetPosition.clone().add(offset)

      // Position et cible actuelles
      const startPosition = cameraRef.current.position.clone()
      const startTarget = controlsRef.current.target.clone()

      // Durée de l'animation en secondes
      const duration = 1.5
      const startTime = clock.getElapsedTime()

      // Arrêter le mouvement orbital de la planète sélectionnée
      planet.userData.orbitSpeed = 0

      // Mettre à jour les informations de la planète sélectionnée
      setSelectedPlanet(planet.userData.planetData)

      // Fonction d'animation
      const animateZoom = () => {
        const currentTime = clock.getElapsedTime()
        const elapsed = currentTime - startTime

        if (elapsed < duration) {
          // Calculer la progression avec easing
          const t = elapsed / duration
          const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easing

          // Interpoler la position de la caméra
          cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easeT)

          // Interpoler la cible des contrôles
          controlsRef.current!.target.lerpVectors(startTarget, planetPosition, easeT)

          // Mettre à jour les contrôles
          controlsRef.current!.update()

          // Continuer l'animation
          animationRef.current = requestAnimationFrame(animateZoom)
        } else {
          // Finaliser l'animation
          cameraRef.current!.position.copy(targetPosition)
          controlsRef.current!.target.copy(planetPosition)
          controlsRef.current!.update()

          // Réactiver les contrôles après l'animation
          controlsRef.current!.enabled = true
        }
      }

      // Démarrer l'animation
      animationRef.current = requestAnimationFrame(animateZoom)
    }

    // Fonction pour revenir à la vue d'ensemble et restaurer le mouvement des planètes
    const resetView = () => {
      if (
        !cameraRef.current ||
        !controlsRef.current ||
        !initialCameraPositionRef.current ||
        !initialControlsTargetRef.current
      )
        return

      // Annuler toute animation en cours
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }

      // Désactiver les contrôles pendant l'animation
      controlsRef.current.enabled = false

      // Position et cible actuelles
      const startPosition = cameraRef.current.position.clone()
      const startTarget = controlsRef.current.target.clone()

      // Position et cible initiales
      const targetPosition = initialCameraPositionRef.current.clone()
      const targetTarget = new THREE.Vector3(0, 0, 0) // Toujours cibler le soleil

      // Durée de l'animation en secondes
      const duration = 1.5
      const startTime = clock.getElapsedTime()

      // Restaurer le mouvement orbital de toutes les planètes
      planetsRef.current.forEach((planet) => {
        const originalSpeed = originalOrbitSpeedsRef.current.get(planet)
        if (originalSpeed !== undefined) {
          planet.userData.orbitSpeed = originalSpeed
        }
      })

      // Réinitialiser la planète sélectionnée
      setSelectedPlanet(null)

      // Fonction d'animation
      const animateReset = () => {
        const currentTime = clock.getElapsedTime()
        const elapsed = currentTime - startTime

        if (elapsed < duration) {
          // Calculer la progression avec easing
          const t = elapsed / duration
          const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easing

          // Interpoler la position de la caméra
          cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easeT)

          // Interpoler la cible des contrôles
          controlsRef.current!.target.lerpVectors(startTarget, targetTarget, easeT)

          // Mettre à jour les contrôles
          controlsRef.current!.update()

          // Continuer l'animation
          animationRef.current = requestAnimationFrame(animateReset)
        } else {
          // Finaliser l'animation
          cameraRef.current!.position.copy(targetPosition)
          controlsRef.current!.target.copy(targetTarget)
          controlsRef.current!.update()

          // Réactiver les contrôles après l'animation
          controlsRef.current!.enabled = true
        }
      }

      // Démarrer l'animation
      animationRef.current = requestAnimationFrame(animateReset)
    }

    // Modifier le gestionnaire de clic
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
            // Simple clic pour faire un gros plan sur la planète
            console.log("Suivre la planète:", planet.userData.solarName)
            setFollowingPlanet(planet)
            zoomToPlanet(planet)
          }
          lastClickTime = Date.now()
        }
      } else {
        // Clic en dehors d'une planète - revenir à la vue d'ensemble
        console.log("Arrêter de suivre")
        setFollowingPlanet(null)
        resetView()
      }
    }

    window.addEventListener("click", handleClick)

    // Assurer que le zoom avec la molette fonctionne correctement
    const handleWheel = (event: WheelEvent) => {
      // Les contrôles OrbitControls gèrent déjà le zoom,
      // mais nous pouvons ajouter des comportements personnalisés si nécessaire
      event.preventDefault()
    }

    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false })

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

        // Orbit around sun (seulement si la vitesse orbitale n'est pas à zéro)
        if (planet.userData.orbitSpeed > 0) {
          planet.userData.orbitAngle += planet.userData.orbitSpeed
          const orbitRadius = planetsDataRef.current.find((p) => p.name === planet.userData.name)?.distance || 10

          planet.position.x = orbitRadius * Math.cos(planet.userData.orbitAngle)
          planet.position.z = orbitRadius * Math.sin(planet.userData.orbitAngle)
        }
      })

      // Check for planet hover
      if (cameraRef.current && sceneRef.current) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
        const intersects = raycasterRef.current.intersectObjects(planetsRef.current)

        if (intersects.length > 0) {
          const planet = intersects[0].object
          setHoveredPlanet(planet.userData.solarName)
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

        // Appliquer les mouvements (configuration AZERTY)
        if (keysPressed.z) camera.position.add(forward)
        if (keysPressed.s) camera.position.sub(forward)
        if (keysPressed.q) camera.position.sub(right)
        if (keysPressed.d) camera.position.add(right)
        if (keysPressed.a) camera.position.y -= moveSpeed
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
      renderer.domElement.removeEventListener("wheel", handleWheel)

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

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

  // Ajouter un message d'aide pour la rotation
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

      {/* Carte d'information de la planète */}
      {selectedPlanet && (
        <div className="fixed bottom-4 left-4 z-20 max-w-sm">
          <Card className="bg-black/70 backdrop-blur-sm border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center" style={{ color: selectedPlanet.color }}>
                {selectedPlanet.solarName}
              </CardTitle>
              <CardDescription className="text-white/80">Section: {selectedPlanet.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <p className="text-white/90 text-sm">{selectedPlanet.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
                <div>
                  <p className="font-semibold">Diamètre</p>
                  <p>{selectedPlanet.diameter}</p>
                </div>
                <div>
                  <p className="font-semibold">Distance du Soleil</p>
                  <p>{selectedPlanet.distanceFromSun}</p>
                </div>
                <div>
                  <p className="font-semibold">Période orbitale</p>
                  <p>{selectedPlanet.orbitalPeriod}</p>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full"
                onClick={() => router.push(selectedPlanet.path)}
                style={{
                  backgroundColor: selectedPlanet.color,
                  color: "#000",
                  borderColor: "transparent",
                }}
              >
                Visiter {selectedPlanet.name} <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white/80 bg-black/50 px-4 py-2 rounded-full text-sm backdrop-blur-sm z-10">
        <p>Cliquez sur une planète pour faire un gros plan • Double-cliquez pour naviguer</p>
        <p className="text-xs mt-1">Cliquez ailleurs pour revenir à la vue d'ensemble</p>
        <p className="text-xs mt-1">
          <strong>Maintenir clic gauche + déplacer</strong> pour tourner autour du système
        </p>
        <p className="text-xs mt-1">Molette pour zoomer • Clic droit + déplacer pour se déplacer latéralement</p>
        <p className="text-xs mt-1">Touches: ZQSD pour se déplacer • A pour descendre • E pour monter</p>
      </div>
    </>
  )
}

