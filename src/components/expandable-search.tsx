"use client"

import * as React from "react"
import { Search, X, Loader2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ExpandableSearchProps {
    onSearch: (query: string) => void
    isLoading?: boolean
    className?: string
    initialQuery?: string
}

export function ExpandableSearch({
    onSearch,
    isLoading = false,
    className,
    initialQuery = ""
}: ExpandableSearchProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [query, setQuery] = React.useState(initialQuery)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Focus textarea when opening
    React.useEffect(() => {
        if (isOpen) {
            // Small delay to allow animation to start/render
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus()
                    // Move cursor to end
                    textareaRef.current.setSelectionRange(
                        textareaRef.current.value.length,
                        textareaRef.current.value.length
                    )
                }
            }, 100)
        }
    }, [isOpen])

    // Prevent scrolling when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (query.trim()) {
            onSearch(query)
            setIsOpen(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
        if (e.key === "Escape") {
            setIsOpen(false)
        }
    }

    return (
        <>
            {/* Search Trigger Pill */}
            <motion.div
                layoutId="search-container"
                className={cn(
                    "relative mx-auto w-fit z-40",
                    className
                )}
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center gap-3 px-4 py-3 bg-background border border-input rounded-full shadow-sm cursor-pointer hover:bg-accent/50 transition-colors group">
                    <Search className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-muted-foreground font-medium pr-10 group-hover:text-foreground transition-colors">
                        Describe what you&apos;re looking for...
                    </span>
                </div>
            </motion.div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            layoutId="search-container"
                            className="relative w-full max-w-3xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                            style={{ maxHeight: "80vh" }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Search className="h-5 w-5" />
                                    <span className="text-sm font-medium">Search</span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Input Area */}
                            <div className="p-6">
                                <textarea
                                    ref={textareaRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Describe what you're looking for...&#10;e.g. 'Sci-fi movies from the 80s with a great soundtrack'"
                                    className="w-full min-h-[200px] bg-transparent text-2xl sm:text-3xl md:text-4xl font-medium placeholder:text-muted-foreground/30 border-none focus:ring-0 resize-none outline-none leading-tight"
                                />
                            </div>

                            {/* Footer / Actions */}
                            <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-t border-border/50">
                                <div className="text-xs text-muted-foreground hidden sm:block">
                                    Press <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">Enter</kbd> to search
                                </div>
                                <div className="flex items-center gap-3 ml-auto">
                                    {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                                    <button
                                        onClick={() => handleSubmit()}
                                        disabled={!query.trim() || isLoading}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all",
                                            query.trim()
                                                ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl translate-y-0"
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        <span>Search</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
