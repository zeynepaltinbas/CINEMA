import Link from "next/link"
import Pagination from "@/components/Pagination"
import SortMenu from "@/components/SortMenu"
import ShowBox from "@/components/ShowBox"
// @ means root directory --> also declared in tsconfig.json

// searchParams: query params
export default async function Home({ searchParams }: any) {
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
        <main className="min-h-screen px-4 py-10 max-w-7xl mx-auto">
            <form action="/" method="GET" className="flex gap-2 mb-10 max-w-xl mx-auto">
                <input
                    type="text"
                    name="query"
                    placeholder="Search for a movie..."
                    defaultValue={searchQuery}
                    className="flex-1 bg-[#1e293b] border border-[#2d3f55] rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                />
                <button
                    type="submit"
                    className="bg-indigo-400 text-[#0f172a] font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-300 transition-colors cursor-pointer"
                >
                    Search
                </button>
            </form>

            <div className="flex gap-6 items-start">
                {!searchQuery && (
                    <aside className="w-52 shrink-0">
                        <SortMenu currentFilters={currentSort} currentGenre={currentGenre}/>
                    </aside>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold mb-6">
                        {searchQuery ? `Results for "${searchQuery}"` : "Popular Movies"}
                    </h1>

                    {movies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {movies.map((m: any) => (
                                <ShowBox
                                    key={m.id}
                                    show = {m}
                                    currentPage={currentPage}
                                    searchQuery={searchQuery}
                                    currentSort={currentSort}
                                    currentGenre={currentGenre}
                                    type="movies"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-20 text-lg">No movies found.</p>
                    )}

                    <Pagination 
                        currentPage = {currentPage}
                        totalPages = {totalPages}
                        searchQuery = {searchQuery}
                        moviesLength = {movies.length}
                        currentGenre = {currentGenre}
                        currentSort = {currentSort}
                    />
                </div>
            </div>
        </main>
    )
}