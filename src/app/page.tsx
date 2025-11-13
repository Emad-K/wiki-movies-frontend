"use client"

import { useRouter } from "next/navigation"
import { Film, Search } from "lucide-react"
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

      {/* Trending Movies Section */}
      <TrendingMovies />
    </div>
  )
}
