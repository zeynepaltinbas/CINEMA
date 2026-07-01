import { TMDB_API_BASE_URL } from "@/lib/tmdb"
import { NextResponse } from "next/server"

const validMediaTypes = ["movie", "tv"]

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get("mediaId")
    const mediaType = searchParams.get("mediaType")
    const page = searchParams.get("page") || "1"

    if (!mediaId || !mediaType || !validMediaTypes.includes(mediaType)) {
        return NextResponse.json({ error: "Missing or invalid review request." }, { status: 400 })
    }

    if (!process.env.TMDB_API_KEY) {
        return NextResponse.json({ error: "Missing TMDB API key." }, { status: 500 })
    }

    const response = await fetch(
        `${TMDB_API_BASE_URL}/${mediaType}/${mediaId}/reviews?api_key=${process.env.TMDB_API_KEY}&page=${page}`,
        { cache: "no-store" }
    )

    if (!response.ok) {
        return NextResponse.json({ error: "Could not load external reviews." }, { status: response.status })
    }
    const data = await response.json()

    return NextResponse.json(data)
}