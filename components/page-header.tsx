import { GlassPanel } from "@/components/glass-panel"

interface PageHeaderProps {
  title: string
  subtitle: string
  description: string
}

export function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <GlassPanel className="text-center max-w-3xl mx-auto p-8 mb-8">
      <h1 className="page-title text-4xl font-bold mb-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {title}
      </h1>

      <h2
        className="page-subtitle text-xl text-muted-foreground mb-4 animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        {subtitle}
      </h2>

      <p className="page-description text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
        {description}
      </p>
    </GlassPanel>
  )
}

