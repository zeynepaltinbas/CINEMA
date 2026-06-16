import ContentGrid from "@/components/ContentGrid";

export default async function MoviesPage({ searchParams }: any) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const searchQuery = params.query || ""
    const currentSort = params.sort || "popularity.desc"
    const currentGenre = params.genre || ""

    const endpoint = searchQuery 
        ? `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&query=${searchQuery}`
        : `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&sort_by=${currentSort}${currentGenre ? `&with_genres=${currentGenre}` : ""}`

    const res = await fetch(endpoint)
    const data = await res.json()
    // tmdb movie array: results
    const movies = data.results || []
    const totalPages = data.total_pages || 0

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
            type="movies"
        />
    )
}