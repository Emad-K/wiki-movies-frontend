"use client"

import Link from "next/link"
import { Film } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 md:px-8 max-w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Wiki Movies</span>
        </Link>

        <ThemeToggle />
      </div>
    </nav>
  )
}

