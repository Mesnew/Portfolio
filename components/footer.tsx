import Link from "next/link"
import { FileText, BarChart2, Github, Linkedin, GitBranch, Lock, BookOpen, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-12 border-t mt-auto w-full bg-primary text-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
            <FileText className="mr-2 h-5 w-5" />
            Documents
          </h3>
          <ul className="space-y-2">
            <li>
              <Link href="/cv.pdf" className="text-white/80 hover:text-white transition-colors flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Télécharger mon CV
              </Link>
            </li>
            <li>
              <Link href="/excel.xlsx" className="text-white/80 hover:text-white transition-colors flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                Télécharger mon Excel
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
            <Mail className="mr-2 h-5 w-5" />
            Me contacter
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors flex items-center"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Link>
            </li>
            <li>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors flex items-center"
              >
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </Link>
            </li>
            <li>
              <Link
                href="https://gitlab.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors flex items-center"
              >
                <GitBranch className="mr-2 h-4 w-4" />
                GitLab
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
            <Lock className="mr-2 h-5 w-5" />
            Autres
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/projet-secret"
                className="text-white/80 hover:text-white transition-colors flex items-center"
              >
                <Lock className="mr-2 h-4 w-4" />
                Projet secret
              </Link>
            </li>
            <li>
              <Link href="/ressources" className="text-white/80 hover:text-white transition-colors flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Mes ressources
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto text-center mt-12 text-white/80">© {currentYear} Votre Nom</div>
    </footer>
  )
}

