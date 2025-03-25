import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SpaceBackground3D } from "@/components/SpaceBackground3D"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function RealisationsPage() {
  const projects = [
    {
      title: "E-commerce Platform",
      description: "Une plateforme e-commerce complète avec panier, paiement et gestion des commandes.",
      image: "/placeholder.svg?height=300&width=600",
      tags: ["Next.js", "TypeScript", "Stripe", "Tailwind CSS"],
      demoUrl: "https://example.com",
      githubUrl: "https://github.com",
    },
    {
      title: "Dashboard Analytics",
      description:
        "Tableau de bord d'analyse de données avec visualisations interactives et rapports personnalisables.",
      image: "/placeholder.svg?height=300&width=600",
      tags: ["React", "D3.js", "Firebase", "Material UI"],
      demoUrl: "https://example.com",
      githubUrl: "https://github.com",
    },
    {
      title: "Application Mobile",
      description: "Application mobile de suivi de fitness avec synchronisation cloud et statistiques personnalisées.",
      image: "/placeholder.svg?height=300&width=600",
      tags: ["React Native", "Redux", "Node.js", "MongoDB"],
      demoUrl: "https://example.com",
      githubUrl: "https://github.com",
    },
    {
      title: "Portfolio Personnel",
      description: "Site portfolio personnel avec sections CV, projets et blog intégré.",
      image: "/placeholder.svg?height=300&width=600",
      tags: ["Next.js", "Tailwind CSS", "Framer Motion", "Vercel"],
      demoUrl: "https://example.com",
      githubUrl: "https://github.com",
    },
  ]

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <SpaceBackground3D />
      <div className="relative z-10 flex flex-col flex-grow">
        <Header />

        <div className="container mx-auto px-4 flex-grow">
          <section className="py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Mes Réalisations</h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Découvrez mes projets en développement web et logiciel. Chaque projet représente un défi unique et des
              compétences spécifiques.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <Button asChild variant="default" size="sm">
                      <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Demo
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </main>
  )
}

