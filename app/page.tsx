import Link from "next/link"

// searchParams: query params
export default async function Home({ searchParams }: any) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const searchQuery = params.query || ""

    const endpoint = searchQuery 
        ? `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&query=${searchQuery}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}`

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

            <h1 className="text-2xl font-bold mb-6">
                {searchQuery ? `Results for "${searchQuery}"` : "Popular Movies"}
            </h1>

            {movies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {movies.map((m: any) => (
                        <Link
                            href={`/movies/${m.id}?from=${currentPage}${searchQuery ? `&query=${searchQuery}` : ''}`}
                            key={m.id}
                            className="group bg-[#1e293b] border border-[#2d3f55] rounded-xl overflow-hidden hover:scale-[1.03] hover:border-indigo-400/50 transition-all duration-200"
                        >
                            <div className="relative aspect-2/3">
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                                    alt={m.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                            <div className="p-2.5">
                                <h2 className="text-sm font-medium line-clamp-2 leading-snug mb-1 text-slate-100">{m.title}</h2>
                                <p className="text-xs text-indigo-400 font-semibold">★ {m.vote_average.toFixed(1)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center py-20 text-lg">No movies found.</p>
            )}

            {/* pagination */}
            <div className="flex items-center justify-center gap-4 mt-12">
                {currentPage > 1 ? (
                    <Link href={`/?page=${currentPage - 1}${searchQuery ? `&query=${searchQuery}` : ''}`}>
                        <button className="px-4 py-2 bg-[#1e293b] border border-[#2d3f55] hover:bg-[#2d3f55] rounded-lg transition-colors cursor-pointer text-sm text-slate-100">
                            ← Prev
                        </button>
                    </Link>
                ) : (
                    <button disabled className="px-4 py-2 bg-[#1e293b] border border-[#2d3f55] text-slate-600 rounded-lg cursor-not-allowed text-sm">
                        ← Prev
                    </button>
                )}
                <span className="text-slate-400 text-sm">
                    Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages ? (
                    <Link href={`/?page=${currentPage + 1}${searchQuery ? `&query=${searchQuery}` : ''}`}>
                        <button className="px-4 py-2 bg-[#1e293b] border border-[#2d3f55] hover:bg-[#2d3f55] rounded-lg transition-colors cursor-pointer text-sm text-slate-100">
                            Next →
                        </button>
                    </Link>
                ) : (
                    <button disabled className="px-4 py-2 bg-[#1e293b] border border-[#2d3f55] text-slate-600 rounded-lg cursor-not-allowed text-sm">
                        Next →
                    </button>
                )}
            </div>

        </main>
    )
}
