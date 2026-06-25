import ContentGrid from "@/components/ContentGrid";
import NowPlayingStrip from "@/components/NowPlaying";
import { TMDB_API_BASE_URL } from "@/lib/tmdb";

export default async function MoviesPage({ searchParams }: any) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const searchQuery = params.query || ""
    const currentSort = params.sort || "popularity.desc"
    const currentGenre = params.genre || ""

    const endpoint = searchQuery
        ? `${TMDB_API_BASE_URL}/search/movie?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&query=${encodeURIComponent(searchQuery)}&region=TR`
        : `${TMDB_API_BASE_URL}/discover/movie?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&sort_by=${currentSort}${currentGenre ? `&with_genres=${currentGenre}` : ""}`

    const nowPlayingEndpoint = `${TMDB_API_BASE_URL}/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&region=TR`

    const [res, nowPlayingRes] = await Promise.all([
        fetch(endpoint),
        fetch(nowPlayingEndpoint),
    ])
    const data = await res.json()
    const nowPlayingData = await nowPlayingRes.json()

    // tmdb movie array: results
    const movies = data.results || []
    const totalPages = data.total_pages || 0

    let nowPlaying = nowPlayingData.results || []
    const npPageCount = nowPlayingData.total_pages || 1

    if (npPageCount > 1) {
        const pagePromises = []

        for (let p = 2; p <= npPageCount; p++) {
            pagePromises.push(
                fetch(`${nowPlayingEndpoint}&page=${p}`)
                    .then(result => result.json())
            )
        }

        const additionalData = await Promise.all(pagePromises)
        additionalData.forEach(page => {
            if (page.results) {
                nowPlaying = [...nowPlaying, ...page.results]
            }
        })
    }

    return (
        <>
            {/* hide the strip while searching */}
            {!searchQuery && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <NowPlayingStrip movies={nowPlaying} />
                </div>
            )}

            <ContentGrid
                title="Popular Movies"
                items={movies}
                totalPages={totalPages}
                currentPage={currentPage}
                searchQuery={searchQuery}
                currentSort={currentSort}
                currentGenre={currentGenre}
                type="movies"
            />
        </>
    )
}
