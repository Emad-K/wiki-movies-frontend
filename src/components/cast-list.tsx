import Image from "next/image"

interface CastMember {
    id: number
    name: string
    character: string
    profile_path: string | null
}

interface CastListProps {
    cast: CastMember[]
}

export function CastList({ cast }: CastListProps) {
    if (!cast || cast.length === 0) return null

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cast.slice(0, 10).map(person => (
                    <div key={person.id} className="space-y-2">
                        {person.profile_path ? (
                            <div className="relative w-full aspect-[2/3]">
                                <Image
                                    src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                                    alt={person.name}
                                    fill
                                    className="object-cover rounded-lg"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                                <span className="text-muted-foreground text-xs">No Image</span>
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-sm">{person.name}</p>
                            <p className="text-xs text-muted-foreground">{person.character}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
