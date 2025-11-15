import { Navigation } from "@/components/navigation"
import { MovieSearch } from "@/components/movie-search"

export default function DiscoverPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <MovieSearch 
          mode="multifield_hybrid_search"
          title="Discover Movies"
          description="Movies related to"
        />
      </main>
    </div>
  )
}

