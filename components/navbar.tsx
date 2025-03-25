"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Menu, Moon, Sun, X } from "lucide-react"
import { GlassPanel } from "@/components/glass-panel"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Fonction pour gérer la navigation avec animation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    closeMenu()
    router.push(href)
  }

  return (
    <nav className={`navbar fixed w-full transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        {/* Bouton menu burger pour mobile */}
        <button id="menu-toggle" className="menu-burger md:hidden" onClick={toggleMenu} aria-label="Menu">
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Logo et liens de navigation */}
        <a
          href="/"
          onClick={(e) => handleNavigation(e, "/")}
          className="logo text-xl font-bold relative overflow-hidden group"
        >
          <span className="relative z-10">Mon Portfolio</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
        </a>

        {/* Navigation desktop */}
        <ul className="hidden md:flex items-center space-x-6">
          <li>
            <a
              href="/cv"
              onClick={(e) => handleNavigation(e, "/cv")}
              className="hover:text-primary transition-colors relative group"
            >
              <span>CV</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </li>
          <li>
            <a
              href="/realisations"
              onClick={(e) => handleNavigation(e, "/realisations")}
              className="hover:text-primary transition-colors relative group"
            >
              <span>Réalisations</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </li>
          <li>
            <a
              href="/veille"
              onClick={(e) => handleNavigation(e, "/veille")}
              className="hover:text-primary transition-colors relative group"
            >
              <span>Veille Technologique</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </li>
          <li>
            <a
              href="/contact"
              onClick={(e) => handleNavigation(e, "/contact")}
              className="hover:text-primary transition-colors relative group"
            >
              <span>Contact</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </li>
        </ul>

        {/* Bouton thème */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="theme-btn relative overflow-hidden"
            aria-label={theme === "dark" ? "Passer au mode clair" : "Passer au mode sombre"}
          >
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 transition-transform duration-300 hover:scale-100"></div>
            {theme === "dark" ? <Sun className="h-5 w-5 relative z-10" /> : <Moon className="h-5 w-5 relative z-10" />}
          </Button>
        )}

        {/* Menu mobile */}
        {isMenuOpen && (
          <GlassPanel className="nav-links active md:hidden fixed inset-0 z-50">
            <div className="flex flex-col items-center justify-center h-full">
              <ul className="flex flex-col items-center space-y-8 py-8">
                <li>
                  <a
                    href="/"
                    onClick={(e) => handleNavigation(e, "/")}
                    className="text-2xl font-medium hover:text-primary transition-colors"
                  >
                    Accueil
                  </a>
                </li>
                <li>
                  <a
                    href="/cv"
                    onClick={(e) => handleNavigation(e, "/cv")}
                    className="text-2xl font-medium hover:text-primary transition-colors"
                  >
                    CV
                  </a>
                </li>
                <li>
                  <a
                    href="/realisations"
                    onClick={(e) => handleNavigation(e, "/realisations")}
                    className="text-2xl font-medium hover:text-primary transition-colors"
                  >
                    Réalisations
                  </a>
                </li>
                <li>
                  <a
                    href="/veille"
                    onClick={(e) => handleNavigation(e, "/veille")}
                    className="text-2xl font-medium hover:text-primary transition-colors"
                  >
                    Veille Technologique
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    onClick={(e) => handleNavigation(e, "/contact")}
                    className="text-2xl font-medium hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </GlassPanel>
        )}
      </div>
    </nav>
  )
}

