import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SpaceBackground3D } from "@/components/SpaceBackground3D"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AtSign, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <SpaceBackground3D />
      <div className="relative z-10 flex flex-col flex-grow">
        <Header />

        <div className="container mx-auto px-4 flex-grow">
          <section className="py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Contact</h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Envoyez-moi un message pour échanger sur un projet ou simplement pour discuter.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-moi un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et je vous répondrai dans les plus brefs délais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input id="name" placeholder="Votre nom" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="subject">Sujet</Label>
                      <Input id="subject" placeholder="Sujet de votre message" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Votre message" rows={5} />
                    </div>

                    <Button type="submit" className="w-full">
                      Envoyer
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <AtSign className="h-5 w-5 mr-3 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-muted-foreground">contact@example.com</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-3 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Téléphone</h3>
                        <p className="text-muted-foreground">+33 6 12 34 56 78</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Adresse</h3>
                        <p className="text-muted-foreground">Paris, France</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Disponibilité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Je suis généralement disponible du lundi au vendredi, de 9h à 18h. N'hésitez pas à me contacter
                      pour discuter de votre projet ou pour toute question.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </main>
  )
}

