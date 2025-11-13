import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Film } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Film className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">
              Movie Finder
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Discover movies using AI-powered semantic search
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/search">
            <Button size="lg" className="text-lg px-8 py-6 gap-3">
              <Search className="h-5 w-5" />
              Start Searching
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            Search by title, director, actors, plot, or any movie details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="space-y-2">
            <h3 className="font-semibold">Semantic Search</h3>
            <p className="text-sm text-muted-foreground">
              Find movies by describing the plot or themes
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Advanced Filters</h3>
            <p className="text-sm text-muted-foreground">
              Filter by country, language, director, and more
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Real-time Results</h3>
            <p className="text-sm text-muted-foreground">
              Get instant movie recommendations with posters
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
