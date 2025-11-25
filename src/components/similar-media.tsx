import Image from "next/image"
import Link from "next/link"
import { Star, Calendar } from "lucide-react"

interface MediaItem {
    id: number
    title?: string
    name?: string
    poster_path: string | null
    vote_average: number
    release_date?: string
    first_air_date?: string
}

interface SimilarMediaProps {
    similar: {
        results: MediaItem[]
    }
    type: 'movie' | 'tv'
}

export function SimilarMedia({ similar, type }: SimilarMediaProps) {
    if (!similar || !similar.results || similar.results.length === 0) return null

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similar.results.slice(0, 10).map(item => {
                    const title = item.title || item.name
                    const date = item.release_date || item.first_air_date
                    const year = date ? new Date(date).getFullYear() : null
                    const link = `/${type}/${item.id}`

                    return (
                        <Link key={item.id} href={link} className="group space-y-2 block">
                            <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg">
                                {item.poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        alt={title || 'Media poster'}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <span className="text-muted-foreground text-xs">No Image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    {year && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{year}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span>{item.vote_average.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
