"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Film, Search, Sparkles, ArrowRight } from "lucide-react"
import { TrendingMovies } from "@/components/trending-movies"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, FormEvent } from "react"

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/search')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Search */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-20">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Film className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Wiki Movies
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground">
              Discover movies using AI-powered semantic search
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title, director, actors, plot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Search
              </Button>
            </div>
          </form>

          <p className="text-sm text-muted-foreground">
            Use semantic search to find movies by plot, themes, or any details
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 px-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/search"
              className="group p-6 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Search className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Semantic Search
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Search movies by plot, themes, characters, or any description using AI.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/similar"
              className="group p-6 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Similar Movies
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find movies similar to your favorites based on plot and style.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/discover"
              className="group p-6 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Film className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Discover Movies
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Discover related movies using advanced multi-field hybrid search.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Trending Movies Section */}
      <TrendingMovies />
    </div>
  )
}
