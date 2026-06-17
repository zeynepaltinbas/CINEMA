// Next.js will pass params.id into this file
import Link from "next/link"

export default async function MovieInfo({ params, searchParams }: any) {
    const params2 = await params
    const movieId = params2.id
    const searchPar = await searchParams
    const returnPage = searchPar.from || 1
    const searchQuery = searchPar.query || ''
    const genre = searchPar.genre || ''
    const sort = searchPar.sort || ''

    const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits,release_dates`
    )
    const movie = await res.json()

    const topCast = movie.credits?.cast?.slice(0, 5) || []
    const director = movie.credits?.crew?.find((member: any) => member.job === "Director")

    return (
        <main className="min-h-screen px-4 py-10 max-w-5xl mx-auto relative text-slate-100">
            
            {movie.backdrop_path && (
                <div className="absolute top-0 left-0 w-full h-[45vh] overflow-hidden -z-10">
                    <img 
                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
                        alt="" 
                        className="w-full h-full object-cover opacity-70 blur-sm"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0f172a]/40 to-[#0f172a]"></div>
                </div>
            )}

            <Link
                href={`/?page=${returnPage}${searchQuery ? `&query=${searchQuery}` : ''}${genre ? `&genre=${genre}` : ''}${sort ? `&sort=${sort}` : ''}`}
                className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors mb-10 text-sm font-medium"
            >
                ← Go back
            </Link>

            <div className="flex flex-col md:flex-row gap-10">
                <div className="shrink-0 mx-auto md:mx-0">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-52 md:w-64 rounded-2xl shadow-2xl border border-[#2d3f55]/30"
                    />
                </div>

                <div className="flex flex-col gap-5 min-w-0 flex-1">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold text-slate-100">{movie.title}</h1>
                        </div>
                        <p className="text-slate-400 italic text-sm mt-1">{movie.tagline}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {movie.genres.map((g: any) => (
                            <span key={g.id} className="text-xs bg-indigo-400/20 text-indigo-400 px-3 py-1 rounded-full font-medium">
                                {g.name}
                            </span>
                        ))}
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Summary</p>
                        <p className="text-slate-300 leading-relaxed text-sm">{movie.overview}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-[#1e293b] rounded-xl p-3 border border-[#2d3f55]">
                            <p className="text-xs text-slate-400 mb-1">Rating</p>
                            <p className="text-indigo-400 font-bold">★ {movie.vote_average.toFixed(1)}</p>
                        </div>
                        <div className="bg-[#1e293b] rounded-xl p-3 border border-[#2d3f55]">
                            <p className="text-xs text-slate-400 mb-1">Status</p>
                            <p className="font-medium text-sm text-slate-100">{movie.status}</p>
                        </div>
                        <div className="bg-[#1e293b] rounded-xl p-3 border border-[#2d3f55]">
                            <p className="text-xs text-slate-400 mb-1">Release Date</p>
                            <p className="font-medium text-sm text-slate-100">{movie.release_date}</p>
                        </div>
                        <div className="bg-[#1e293b] rounded-xl p-3 border border-[#2d3f55]">
                            <p className="text-xs text-slate-400 mb-1">Runtime</p>
                            <p className="font-medium text-sm text-slate-100">{movie.runtime} min</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#2d3f55]/40 pt-4">
                        {director && (
                            <p className="text-sm text-slate-400">
                                Director: <span className="text-slate-200 font-semibold">{director.name}</span>
                            </p>
                        )}
                        
                        {topCast.length > 0 && (
                            <p className="text-sm text-slate-400">
                                Featuring:{" "}
                                {topCast.map((actor: any, idx: number) => (
                                    <span key={actor.id} className="text-slate-200 font-medium">
                                        {actor.name}{idx < topCast.length - 1 ? ", " : ""}
                                    </span>
                                ))}
                            </p>
                        )}

                        <p className="text-sm text-slate-400">
                            Original language: <span className="text-slate-100 font-medium uppercase">{movie.original_language}</span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}