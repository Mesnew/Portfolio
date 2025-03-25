import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SpaceBackground3D } from "@/components/SpaceBackground3D"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <SpaceBackground3D />
      <div className="relative z-10 flex flex-col flex-grow">
        <Header />

        <div className="container mx-auto px-4 flex-grow">
          <section className="py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Page de Test</h1>

            <div className="max-w-3xl mx-auto">
              <Card className="mb-8 bg-black/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Le Trou Noir</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Un trou noir est une région de l'espace-temps dont le champ gravitationnel est si intense qu'il
                    empêche toute forme de matière ou de rayonnement de s'en échapper.
                  </p>
                  <p className="mb-4">
                    La théorie de la relativité générale prédit que lorsqu'une masse suffisamment grande est concentrée
                    dans une région suffisamment petite de l'espace, l'espace-temps se déforme à tel point qu'il forme
                    un trou noir.
                  </p>
                  <p>
                    Autour du trou noir, on peut observer un disque d'accrétion, composé de matière qui tombe vers le
                    trou noir en spiralant. Cette matière est chauffée par friction et émet un rayonnement intense avant
                    de franchir l'horizon des événements.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8 bg-black/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Lentille Gravitationnelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    La lentille gravitationnelle est un phénomène de déformation des rayons lumineux par un champ
                    gravitationnel intense, comme celui d'un trou noir.
                  </p>
                  <p>
                    Ce phénomène a été prédit par Albert Einstein dans sa théorie de la relativité générale. Il permet
                    d'observer des objets normalement cachés derrière d'autres corps célestes, et peut créer des images
                    multiples ou déformées d'objets lointains.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Météorites et Astéroïdes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Les météorites sont des fragments de roche qui survivent à leur passage dans l'atmosphère d'une
                    planète et atteignent sa surface.
                  </p>
                  <p>
                    Les astéroïdes sont des corps rocheux plus petits que des planètes qui orbitent autour du Soleil.
                    Dans notre simulation, ils orbitent autour du trou noir, attirés par son intense champ
                    gravitationnel.
                  </p>
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

