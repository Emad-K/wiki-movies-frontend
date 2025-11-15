import { Navigation } from "@/components/navigation"
import { SimilaritySearch } from "@/components/similarity-search"

export default function SimilarPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <SimilaritySearch />
      </main>
    </div>
  )
}

