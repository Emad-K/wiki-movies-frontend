import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Play } from "lucide-react"
import {
    SiNetflix,
    SiAppletv,
    SiAmazonprime,
    SiHbo,
    SiParamountplus,
    SiMax,
} from "react-icons/si"

interface Provider {
    provider_id: number
    provider_name: string
    logo_path: string
}

interface WatchProviders {
    results: {
        [key: string]: {
            link: string
            flatrate?: Provider[]
            rent?: Provider[]
            buy?: Provider[]
        }
    }
}

interface WatchProviderProps {
    providers?: WatchProviders
    className?: string
    homepage?: string
}

const StreamingIcons = {
    Disney: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M10.744 5.83c-1.34-.11-2.68.22-3.8.94 2.83 1.47 6.16 1.77 9.21.84 1.25-.38 2.45-.94 3.56-1.66-3.13-1.69-6.85-1.57-9.87.52-.37-.25-.74-.46-1.1-.64zm-6.68 5.7c.06.09.12.18.19.27 1.32 1.77 3.58 2.64 5.77 2.22 1.48-.28 2.81-1.09 3.82-2.31.78-.94 1.33-2.06 1.59-3.25-2.93 1.06-6.14.94-8.99-.34-.94 1.06-1.78 2.24-2.38 3.41zm15.87-3.94c-.95.63-1.98 1.12-3.06 1.46 1.47 1.6 2.1 3.82 1.68 5.96-.28 1.45-1.02 2.76-2.09 3.76-1.58 1.48-3.77 2.12-5.91 1.73-2.14-.39-4.02-1.75-5.08-3.67-.71-1.28-1.01-2.76-.87-4.22-1.65 2.11-2.13 4.93-1.27 7.51.64 1.92 1.99 3.55 3.76 4.54 2.62 1.47 5.86 1.35 8.35-.32 1.68-1.13 2.94-2.76 3.59-4.67.65-1.91.53-4.04-.34-5.86-.46-.97-1.1-1.86-1.88-2.63.71-.56 1.38-1.17 2.02-1.82-.3-.26-.6-.51-.9-.77z" />
        </svg>
    ),
    Hulu: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M21.96 14.04c-.012-4.38-3.552-7.92-7.92-7.92-4.368 0-7.92 3.552-7.92 7.92 0 4.368 3.552 7.92 7.92 7.92 4.38 0 7.92-3.54 7.92-7.92zM2.04 14.04c0-4.38 3.54-7.92 7.92-7.92 4.368 0 7.92 3.552 7.92 7.92 0 4.368-3.552 7.92-7.92 7.92-4.38 0-7.92-3.54-7.92-7.92z" />
        </svg>
    ),
    Peacock: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            <circle cx="12" cy="12" r="4" />
        </svg>
    )
}

// Map of provider names to their React Icons components
const PROVIDER_ICONS: Record<string, React.ElementType> = {
    "Netflix": SiNetflix,
    "Disney Plus": StreamingIcons.Disney,
    "Apple TV Plus": SiAppletv,
    "Apple TV": SiAppletv,
    "Hulu": StreamingIcons.Hulu,
    "Amazon Prime Video": SiAmazonprime,
    "HBO": SiHbo,
    "HBO Max": SiHbo,
    "Max": SiMax,
    "Paramount Plus": SiParamountplus,
    "Peacock": StreamingIcons.Peacock,
    "Peacock Premium": StreamingIcons.Peacock,
}

export function WatchProvider({ providers, className, homepage }: WatchProviderProps) {
    // Default to US for now, could be dynamic based on user locale
    const countryCode = "US"
    const providerData = providers?.results?.[countryCode]

    if (!providerData?.flatrate || providerData.flatrate.length === 0) {
        return null
    }

    // Prioritize major platforms if multiple exist, otherwise take the first one
    const mainProvider = providerData.flatrate[0]
    const IconComponent = PROVIDER_ICONS[mainProvider.provider_name]

    // Use homepage if available, otherwise fallback to TMDB link
    const watchLink = homepage || providerData.link

    const handleWatchClick = () => {
        if (watchLink) {
            window.open(watchLink, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Button
                        size="lg"
                        onClick={handleWatchClick}
                        className={`gap-3 text-base font-semibold h-12 px-4 shadow-lg hover:scale-105 transition-transform bg-[#f4f4f5] text-black hover:bg-[#e4e4e7] dark:bg-[#09090b] dark:text-white dark:hover:bg-[#09090b]/90 border-none ${className}`}
                    >
                        <div className="h-8 flex items-center justify-center">
                            {IconComponent ? (
                                <IconComponent style={{ height: '24px', width: 'auto' }} />
                            ) : (
                                <Play className="w-6 h-6 fill-current" />
                            )}
                        </div>
                        Watch
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>Watch on {mainProvider.provider_name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
