"use client"

import { useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Vector3, Color, MathUtils } from "three"
import { useTheme } from "next-themes"

function Particles({ count = 200 }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const mesh = useRef(null)
  const dummy = useRef(new Vector3())
  const particles = useRef([])
  const colorLight = new Color("#00c8c8")
  const colorDark = new Color("#00a0a0")

  // Initialize particles
  useEffect(() => {
    particles.current = Array.from({ length: count }, () => ({
      position: new Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15),
      velocity: new Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
      size: Math.random() * 0.5 + 0.1,
    }))
  }, [count])

  useFrame(() => {
    if (!mesh.current) return

    const positions = mesh.current.geometry.attributes.position.array
    const scales = mesh.current.geometry.attributes.scale.array

    let i = 0
    for (let p = 0; p < particles.current.length; p++) {
      const particle = particles.current[p]

      // Update position based on velocity
      particle.position.add(particle.velocity)

      // Boundary check and bounce
      if (Math.abs(particle.position.x) > 10) particle.velocity.x *= -1
      if (Math.abs(particle.position.y) > 10) particle.velocity.y *= -1
      if (Math.abs(particle.position.z) > 10) particle.velocity.z *= -1

      // Update the instance position
      dummy.current.copy(particle.position)
      dummy.current.toArray(positions, i * 3)
      scales[i] = particle.size
      i++
    }

    mesh.current.geometry.attributes.position.needsUpdate = true
    mesh.current.geometry.attributes.scale.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 10, 10]}>
        <instancedBufferAttribute attach="attributes-scale" args={[new Float32Array(count), 1]} />
      </sphereGeometry>
      <meshBasicMaterial color={isDark ? colorDark : colorLight} />
    </instancedMesh>
  )
}

function Lines({ count = 40 }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const group = useRef()
  const lines = useRef([])

  // Initialize lines
  useEffect(() => {
    lines.current = Array.from({ length: count }, () => ({
      start: new Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20),
      end: new Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20),
      velocity: new Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01),
    }))
  }, [count])

  useFrame(() => {
    if (!group.current) return

    lines.current.forEach((line, i) => {
      // Update position based on velocity
      line.start.add(line.velocity)
      line.end.add(line.velocity)

      // Boundary check and bounce
      if (Math.abs(line.start.x) > 10 || Math.abs(line.end.x) > 10) line.velocity.x *= -1
      if (Math.abs(line.start.y) > 10 || Math.abs(line.end.y) > 10) line.velocity.y *= -1
      if (Math.abs(line.start.z) > 10 || Math.abs(line.end.z) > 10) line.velocity.z *= -1

      // Update the line positions
      const lineObj = group.current.children[i]
      lineObj.geometry.setFromPoints([line.start, line.end])
      lineObj.geometry.verticesNeedUpdate = true
    })
  })

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => (
        <line key={i}>
          <bufferGeometry />
          <lineBasicMaterial color={isDark ? "#00a0a0" : "#00c8c8"} opacity={0.2} transparent />
        </line>
      ))}
    </group>
  )
}

function CameraController() {
  const { camera } = useThree()
  const controls = useRef()

  useEffect(() => {
    camera.position.set(0, 0, 20)
  }, [camera])

  useFrame(() => {
    if (controls.current) {
      controls.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controls}
      args={[camera]}
      enableZoom={false}
      enablePan={false}
      enableRotate={true}
      rotateSpeed={0.2}
      autoRotate={true}
      autoRotateSpeed={0.1}
    />
  )
}

function MouseFollower() {
  const mesh = useRef()
  const { camera } = useThree()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!mesh.current) return

      // Convert mouse position to normalized device coordinates (-1 to +1)
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1

      // Project mouse position to 3D space
      const vector = new Vector3(x, y, 0.5)
      vector.unproject(camera)

      const dir = vector.sub(camera.position).normalize()
      const distance = -camera.position.z / dir.z
      const pos = camera.position.clone().add(dir.multiplyScalar(distance))

      // Limit the position to a reasonable range
      pos.x = MathUtils.clamp(pos.x, -10, 10)
      pos.y = MathUtils.clamp(pos.y, -10, 10)

      // Apply some easing
      mesh.current.position.x = MathUtils.lerp(mesh.current.position.x, pos.x, 0.1)
      mesh.current.position.y = MathUtils.lerp(mesh.current.position.y, pos.y, 0.1)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [camera])

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color={isDark ? "#00ffff" : "#00c8c8"} transparent opacity={0.6} />
    </mesh>
  )
}

export function Background3D() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <color attach="background" args={[isDark ? "#030712" : "#ffffff"]} />
        <CameraController />
        <ambientLight intensity={0.5} />
        <Particles />
        <Lines />
        <MouseFollower />
      </Canvas>
    </div>
  )
}

