import ContentGrid from "@/components/ContentGrid";

export default async function MoviesPage({ searchParams }: any) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const searchQuery = params.query || ""
    const currentSort = params.sort || "popularity.desc"
    const currentGenre = params.genre || ""
    const currentTab = params.tab || "popular"

    const endpoint = currentTab === "now_playing"
        ? `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&region=TR`
        : searchQuery
            ? `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&query=${encodeURIComponent(searchQuery)}&region=TR`
            : `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&sort_by=${currentSort}${currentGenre ? `&with_genres=${currentGenre}` : ""}`

    const res = await fetch(endpoint)
    const data = await res.json()
    // tmdb movie array: results
    let movies = data.results || []
    let totalPages = data.total_pages || 0

    if (currentTab === "now_playing" && searchQuery) {
        movies = movies.filter((movie: any) => 
            movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.original_title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        totalPages = 1
    }

    return (
        <ContentGrid
            title="Popular Movies"
            placeholder="Search for a Movie..."
            formAction="/movies"
            items={movies}
            totalPages={totalPages}
            currentPage={currentPage}
            searchQuery={searchQuery}
            currentSort={currentSort}
            currentGenre={currentGenre}
            currentTab={currentTab}
            type="movies"
        />
    )
}