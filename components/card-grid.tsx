import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Code, Lightbulb, Mail } from "lucide-react"
import Link from "next/link"

export function CardGrid() {
  const cards = [
    {
      title: "Mon CV",
      icon: <FileText className="h-12 w-12 text-primary" />,
      description: "Découvrez mon parcours académique et professionnel.",
      href: "/cv",
    },
    {
      title: "Mes Réalisations",
      icon: <Code className="h-12 w-12 text-primary" />,
      description: "Explorez mes projets en développement web et logiciel.",
      href: "/realisations",
    },
    {
      title: "Veille Technologique",
      icon: <Lightbulb className="h-12 w-12 text-primary" />,
      description: "Suivez ma veille sur les dernières tendances du numérique.",
      href: "/veille",
    },
    {
      title: "Contact",
      icon: <Mail className="h-12 w-12 text-primary" />,
      description: "Envoyez-moi un message pour échanger sur un projet.",
      href: "/contact",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
      {cards.map((card, index) => (
        <Link href={card.href} key={index}>
          <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
            <CardHeader className="flex items-center justify-center pt-6">{card.icon}</CardHeader>
            <CardContent className="text-center">
              <CardTitle className="mb-4">{card.title}</CardTitle>
              <p className="text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

