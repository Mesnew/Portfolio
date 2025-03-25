import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SpaceBackground3D } from "@/components/SpaceBackground3D"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function VeillePage() {
  const articles = [
    {
      title: "Les tendances du développement web en 2024",
      description: "Découvrez les technologies et frameworks qui dominent le paysage du développement web cette année.",
      image: "/placeholder.svg?height=200&width=400",
      date: "15 Mars 2024",
      readTime: "5 min",
      tags: ["Web", "JavaScript", "Frameworks"],
      url: "https://example.com/article1",
    },
    {
      title: "L'intelligence artificielle dans le développement",
      description: "Comment l'IA transforme les processus de développement et améliore la productivité des équipes.",
      image: "/placeholder.svg?height=200&width=400",
      date: "28 Février 2024",
      readTime: "8 min",
      tags: ["IA", "Développement", "Productivité"],
      url: "https://example.com/article2",
    },
    {
      title: "Sécurité web : les meilleures pratiques",
      description: "Guide complet des meilleures pratiques de sécurité pour protéger vos applications web.",
      image: "/placeholder.svg?height=200&width=400",
      date: "10 Février 2024",
      readTime: "10 min",
      tags: ["Sécurité", "Web", "Bonnes pratiques"],
      url: "https://example.com/article3",
    },
    {
      title: "Performance des applications Next.js",
      description: "Techniques d'optimisation pour améliorer la performance de vos applications Next.js.",
      image: "/placeholder.svg?height=200&width=400",
      date: "5 Février 2024",
      readTime: "7 min",
      tags: ["Next.js", "Performance", "Optimisation"],
      url: "https://example.com/article4",
    },
  ]

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <SpaceBackground3D />
      <div className="relative z-10 flex flex-col flex-grow">
        <Header />

        <div className="container mx-auto px-4 flex-grow">
          <section className="py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Veille Technologique</h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Suivez ma veille sur les dernières tendances du numérique. Je partage régulièrement des articles, des
              analyses et des ressources.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article, index) => (
                <Card key={index}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {article.date}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {article.readTime}
                      </span>
                    </div>
                    <CardTitle>{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{article.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild>
                      <Link href={article.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Lire l'article
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

