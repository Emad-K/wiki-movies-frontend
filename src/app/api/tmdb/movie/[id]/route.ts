import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${env.TMDB_API_KEY}&append_to_response=credits,videos,images,similar,content_ratings`,
            {
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch movie details' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
