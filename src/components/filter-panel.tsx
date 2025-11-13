"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Loader2, ChevronDown } from "lucide-react"
import type { FieldEnum } from "@/lib/types/api"

interface FilterPanelProps {
  filters: Record<string, string>
  onFiltersChange: (filters: Record<string, string>) => void
  onClose?: () => void
}

const FILTER_FIELDS: Array<{ key: FieldEnum; label: string; isSelect?: boolean; options?: string[] }> = [
  // Most important - Media Type first!
  { key: "media_type", label: "Media Type", isSelect: true, options: ["film", "television"] },
  
  // Very important filters
  { key: "title", label: "Title" },
  { key: "director", label: "Director" },
  { key: "starring", label: "Starring" },
  { key: "country", label: "Country" },
  { key: "language", label: "Language" },
  
  // Medium importance
  { key: "producer", label: "Producer" },
  { key: "writer", label: "Writer" },
  { key: "screenplay", label: "Screenplay" },
  { key: "story", label: "Story" },
  { key: "studio", label: "Studio" },
  { key: "production_companies", label: "Production Companies" },
  
  // Less important - technical credits
  { key: "music", label: "Music" },
  { key: "cinematography", label: "Cinematography" },
  { key: "editing", label: "Editing" },
  { key: "developer", label: "Developer" },
  { key: "distributor", label: "Distributor" },
]

export function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({})
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState<Record<string, boolean>>({})

  const fetchAutocomplete = async (field: string, value: string) => {
    if (!value.trim()) return []

    setIsLoadingAutocomplete((prev) => ({ ...prev, [field]: true }))
    
    try {
      const response = await fetch("/api/autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size: 10,
          field,
          value,
          offset: 0,
        }),
      })

      if (!response.ok) {
        console.error("Autocomplete API error:", response.status)
        return []
      }

      const data = await response.json()
      const suggestions = data.suggestions?.map((s: any) => s.value) || []
      
      return suggestions
    } catch (error) {
      console.error("Autocomplete error:", error)
      return []
    } finally {
      setIsLoadingAutocomplete((prev) => ({ ...prev, [field]: false }))
    }
  }

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    FILTER_FIELDS.forEach((field) => {
      const inputValue = inputs[field.key]
      if (inputValue) {
        const timer = setTimeout(async () => {
          const results = await fetchAutocomplete(field.key, inputValue)
          setSuggestions((prev) => ({ ...prev, [field.key]: results }))
        }, 300)
        timers.push(timer)
      } else {
        setSuggestions((prev) => {
          const newSuggestions = { ...prev }
          delete newSuggestions[field.key]
          return newSuggestions
        })
      }
    })

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [inputs])

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
    
    // Clear filter if input is cleared
    if (!value && filters[field]) {
      const newFilters = { ...filters }
      delete newFilters[field]
      onFiltersChange(newFilters)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    onFiltersChange({ ...filters, [field]: value })
    setInputs((prev) => ({ ...prev, [field]: value }))
    setSuggestions((prev) => {
      const newSuggestions = { ...prev }
      delete newSuggestions[field]
      return newSuggestions
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    // Select first suggestion on Enter
    if (e.key === "Enter" && suggestions[field] && suggestions[field].length > 0) {
      e.preventDefault()
      handleFilterChange(field, suggestions[field][0])
    }
  }

  const clearFilter = (field: string) => {
    const newFilters = { ...filters }
    delete newFilters[field]
    onFiltersChange(newFilters)
    setInputs((prev) => {
      const newInputs = { ...prev }
      delete newInputs[field]
      return newInputs
    })
  }

  return (
    <div className="border-b border-border bg-muted/30">
      {onClose && (
        <div className="flex items-center justify-center border-b border-border/50 py-0.5 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-1.5 w-full hover:bg-muted/50 transition-colors p-0"
          >
            <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
          </Button>
        </div>
      )}
      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-3">
          {FILTER_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key} className="text-sm font-medium flex items-center justify-between">
                <span>{field.label}</span>
                {filters[field.key] && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                    Active
                  </span>
                )}
              </Label>
              <div className="relative">
                <div className="flex gap-2">
                  {field.isSelect ? (
                    // Shadcn Select for predefined options
                    <Select
                      value={filters[field.key] || ""}
                      onValueChange={(value) => {
                        if (value) {
                          handleFilterChange(field.key, value)
                        } else {
                          clearFilter(field.key)
                        }
                      }}
                    >
                      <SelectTrigger 
                        className={`flex-1 ${filters[field.key] ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
                      >
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    // Autocomplete input for other fields
                    <div className="relative flex-1">
                      <Input
                        id={field.key}
                        value={inputs[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, field.key)}
                        placeholder={`Search ${field.label.toLowerCase()}...`}
                        className={`${filters[field.key] ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
                      />
                      {isLoadingAutocomplete[field.key] && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        </div>
                      )}
                    </div>
                  )}
                  {filters[field.key] && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => clearFilter(field.key)} 
                      className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!field.isSelect && suggestions[field.key] && suggestions[field.key].length > 0 && !filters[field.key] && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions[field.key].map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-border last:border-b-0 flex items-center gap-2"
                        onClick={() => handleFilterChange(field.key, suggestion)}
                      >
                        <span className="flex-1">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {Object.keys(filters).length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" 
              onClick={() => onFiltersChange({})}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

