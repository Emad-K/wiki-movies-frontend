"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Send, SlidersHorizontal, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MovieGrid } from "@/components/movie-grid"
import { FilterPanel } from "@/components/filter-panel"
import { cn } from "@/lib/utils"
import type { SearchHit } from "@/lib/types/api"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  movies?: SearchHit[]
}

interface ChatInterfaceProps {
  initialQuery?: string
}

export function ChatInterface({ initialQuery = "" }: ChatInterfaceProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")
  const [currentOffset, setCurrentOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollObserverRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Update URL with query and filters
  const updateUrlParams = (query: string, currentFilters: Record<string, string>) => {
    const params = new URLSearchParams()
    if (query) {
      params.set('q', query)
    }
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    router.replace(`/search?${params.toString()}`, { scroll: false })
  }

  const handleSearch = async (query: string, offset: number = 0, append: boolean = false) => {
    if (!query.trim()) return

    // For new searches, add user message and reset state
    if (!append) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: query,
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      setCurrentOffset(0)
      setHasMore(true)
      setCurrentQuery(query)
    } else {
      setIsLoadingMore(true)
    }

    // Update URL with current query and filters
    if (!append) {
      updateUrlParams(query, filters)
    }

    try {
      const filterArray = Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([field, value]) => ({ field, value: [value] }))

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: query,
          size: 20,
          offset: offset,
          filters: filterArray.length > 0 ? filterArray : undefined,
          mode: "hybrid_search",
        }),
      })

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Check for API errors in response
      if (data.error) {
        throw new Error(data.error)
      }

      if (append) {
        // Append to existing movies
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.movies) {
            const updatedMessage = {
              ...lastMessage,
              movies: [...lastMessage.movies, ...(data.hits || [])],
            }
            return [...prev.slice(0, -1), updatedMessage]
          }
          return prev
        })
        setCurrentOffset(offset + 20)
        setHasMore(data.hits && data.hits.length === 20)
      } else {
        // New search results
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `Found ${data.total || 0} movies matching "${query}"`,
          movies: data.hits || [],
        }
        setMessages((prev) => [...prev, assistantMessage])
        setCurrentOffset(20)
        setHasMore(data.hits && data.hits.length === 20)
      }
    } catch (error) {
      console.error("Search error:", error)
      
      // Only show error message for new searches, not pagination
      if (!append) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: error instanceof Error 
            ? `Error: ${error.message}. Please check if the server is running and try again.`
            : "Sorry, there was an error searching for movies. Please try again.",
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize from URL params
  useEffect(() => {
    const queryFromUrl = searchParams.get('q')
    const filtersFromUrl: Record<string, string> = {}
    
    // Parse filters from URL
    searchParams.forEach((value, key) => {
      if (key !== 'q' && value) {
        filtersFromUrl[key] = value
      }
    })
    
    setFilters(filtersFromUrl)
    
    if (queryFromUrl) {
      handleSearch(queryFromUrl)
    } else if (initialQuery) {
      handleSearch(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-run search when filters change (if there's an active query)
  useEffect(() => {
    if (currentQuery) {
      updateUrlParams(currentQuery, filters)
      handleSearch(currentQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!currentQuery || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          handleSearch(currentQuery, currentOffset, true)
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = scrollObserverRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [currentQuery, currentOffset, hasMore, isLoadingMore])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(input)
    setShowMobileSidebar(false)
  }

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar with chat history and search */}
      <div
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 w-full md:w-96 border-r border-border flex flex-col bg-card transition-transform duration-300 ease-in-out",
          showMobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="border-b border-border p-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setShowMobileSidebar(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="border-t border-border">
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <FilterPanel filters={filters} onFiltersChange={setFilters} onClose={() => setShowFilters(false)} />
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search for movies..."
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {Object.keys(filters).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shadow-lg">
                    {Object.keys(filters).length}
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMobileSidebar(false)} />
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border p-4">
          <Button variant="outline" size="sm" onClick={() => setShowMobileSidebar(true)} className="relative">
            <Menu className="h-4 w-4 mr-2" />
            Search & Filters
            {Object.keys(filters).length > 0 && (
              <span className="ml-2 h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shadow-sm">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
        </div>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground px-4">
            <p className="text-center">Start searching to see results</p>
          </div>
        ) : (
          <div className="p-4 md:p-6">
            {messages
              .filter((m) => m.movies && m.movies.length > 0)
              .map((message) => (
                <div key={message.id} className="mb-8">
                  <h3 className="text-base md:text-lg font-semibold mb-4">{message.content}</h3>
                  <MovieGrid movies={message.movies || []} />
                </div>
              ))}
            
            {/* Infinite scroll trigger */}
            {currentQuery && (
              <div ref={scrollObserverRef} className="h-20 flex items-center justify-center">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-sm">Loading more movies...</span>
                  </div>
                )}
                {!hasMore && messages.some(m => m.movies && m.movies.length > 0) && (
                  <p className="text-sm text-muted-foreground">That's all the results!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

