import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SpaceBackground3D } from "@/components/SpaceBackground3D"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, GraduationCap, Briefcase } from "lucide-react"

export default function CVPage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <SpaceBackground3D />
      <div className="relative z-10 flex flex-col flex-grow">
        <Header />

        <div className="container mx-auto px-4 flex-grow">
          <section className="py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Mon CV</h1>

            <div className="grid gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2" />
                    Formation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-l-2 border-primary pl-4 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      2020 - 2023
                    </div>
                    <h3 className="text-lg font-semibold">Master en Développement Web</h3>
                    <p>Université de Paris</p>
                    <p className="text-muted-foreground">
                      Formation complète en développement web front-end et back-end, avec spécialisation en React et
                      Node.js.
                    </p>
                  </div>

                  <div className="border-l-2 border-primary pl-4 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      2017 - 2020
                    </div>
                    <h3 className="text-lg font-semibold">Licence en Informatique</h3>
                    <p>Université de Lyon</p>
                    <p className="text-muted-foreground">
                      Fondamentaux de l'informatique, algorithmique, et programmation.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2" />
                    Expérience Professionnelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-l-2 border-primary pl-4 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      2023 - Présent
                    </div>
                    <h3 className="text-lg font-semibold">Développeur Full Stack</h3>
                    <p>Entreprise Tech</p>
                    <p className="text-muted-foreground">
                      Développement d'applications web avec React, Next.js, et Node.js. Mise en place d'architectures
                      cloud sur AWS.
                    </p>
                  </div>

                  <div className="border-l-2 border-primary pl-4 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      2021 - 2023
                    </div>
                    <h3 className="text-lg font-semibold">Développeur Front-end</h3>
                    <p>Agence Web</p>
                    <p className="text-muted-foreground">
                      Création d'interfaces utilisateur réactives et accessibles avec React et TypeScript.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compétences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Langages de programmation</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge>JavaScript</Badge>
                        <Badge>TypeScript</Badge>
                        <Badge>HTML</Badge>
                        <Badge>CSS</Badge>
                        <Badge>Python</Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Frameworks & Bibliothèques</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge>React</Badge>
                        <Badge>Next.js</Badge>
                        <Badge>Node.js</Badge>
                        <Badge>Express</Badge>
                        <Badge>Tailwind CSS</Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Outils & Plateformes</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Git</Badge>
                        <Badge>GitHub</Badge>
                        <Badge>Docker</Badge>
                        <Badge>AWS</Badge>
                        <Badge>Vercel</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </main>
  )
}

