import { SolarSystem3D } from "@/components/SolarSystem3D"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <SolarSystem3D />

      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Mon Portfolio</h1>
          <ModeToggle />
        </div>
      </div>
    </main>
  )
}

