import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { Loader2 } from "lucide-react"

function SearchContent() {
  return <ChatInterface />
}

function SearchLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<SearchLoading />}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  )
}

