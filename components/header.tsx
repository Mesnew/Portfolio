"use client"

import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="py-4 border-b w-full">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Mon Portfolio
        </Link>

        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X /> : <Menu />}
        </Button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/cv" className="hover:text-primary transition-colors">
            CV
          </Link>
          <Link href="/realisations" className="hover:text-primary transition-colors">
            Réalisations
          </Link>
          <Link href="/veille" className="hover:text-primary transition-colors">
            Veille Technologique
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
          <ModeToggle />
        </nav>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <nav className="container mx-auto flex flex-col gap-4 py-4 md:hidden">
          <Link href="/cv" className="hover:text-primary transition-colors" onClick={toggleMenu}>
            CV
          </Link>
          <Link href="/realisations" className="hover:text-primary transition-colors" onClick={toggleMenu}>
            Réalisations
          </Link>
          <Link href="/veille" className="hover:text-primary transition-colors" onClick={toggleMenu}>
            Veille Technologique
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors" onClick={toggleMenu}>
            Contact
          </Link>
          <div className="pt-2">
            <ModeToggle />
          </div>
        </nav>
      )}
    </header>
  )
}

