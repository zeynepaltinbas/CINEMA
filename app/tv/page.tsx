import ContentGrid from "@/components/ContentGrid";
import { TMDB_API_BASE_URL } from "@/lib/tmdb";

export default async function TvPage({ searchParams }: any) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const searchQuery = params.query || ""
    const currentSort = params.sort || "popularity.desc"
    const currentGenre = params.genre || ""

    const endpoint = searchQuery 
        ? `${TMDB_API_BASE_URL}/search/tv?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&query=${searchQuery}`
        : `${TMDB_API_BASE_URL}/discover/tv?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&sort_by=${currentSort}${currentGenre ? `&with_genres=${currentGenre}` : ""}`

    const res = await fetch(endpoint)
    const data = await res.json()
    // tmdb movie array: results
    const tvSeries = data.results || []
    const totalPages = data.total_pages || 0

    return (
        <>
            <ContentGrid
                title="Popular TV Series"
                items={tvSeries}
                totalPages={totalPages}
                currentPage={currentPage}
                searchQuery={searchQuery}
                currentSort={currentSort}
                currentGenre={currentGenre}
                type="tv"
            />
        </>
    )
}