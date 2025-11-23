"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpandableTextProps {
    text: string
    limit?: number
    className?: string
}

export function ExpandableText({ text, limit = 300, className }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const shouldTruncate = text.length > limit

    if (!shouldTruncate) {
        return <p className={cn("text-lg text-muted-foreground leading-relaxed", className)}>{text}</p>
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="relative">
                <AnimatePresence initial={false}>
                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : "auto" }}
                        className="overflow-hidden"
                    >
                        <p className={cn(
                            "text-lg text-muted-foreground leading-relaxed",
                            !isExpanded && "line-clamp-3"
                        )}>
                            {text}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
                {isExpanded ? (
                    <>
                        Show Less <ChevronUp className="h-4 w-4" />
                    </>
                ) : (
                    <>
                        Read More <ChevronDown className="h-4 w-4" />
                    </>
                )}
            </button>
        </div>
    )
}
