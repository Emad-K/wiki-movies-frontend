"use client"

import Link from "next/link"
import { Film, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Wiki Movies</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

