import Link from "next/link"

interface NowPlayingStripProps {
    movies: any[];
}

export default function NowPlayingStrip({ movies }: NowPlayingStripProps) {
    if (!movies || movies.length === 0) 
        return null

    return (
        <section className="mb-5 border-b border-[#2d3f55] pb-6">
            <div className="flex items-center gap-2 mb-2 relative">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                    Now Playing in TR
                </h2>

                <div className="group/tooltip relative inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-500 text-slate-400 hover:text-indigo-400 hover:border-indigo-400 transition-colors text-[10px] select-none font-bold">
                    ?
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-56 sm:w-64 bg-[#1e293b] border border-[#2d3f55] text-slate-300 text-[11px] sm:text-xs p-2.5 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 leading-relaxed font-normal">
                        Some festival or indie movies may not have ticket or screening information available in local theaters.
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1e293b]" />
                    </div>
                </div>
            </div>

            {/* horizontal scroll strip */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
            >
                {movies.map((movie) => {
                    const title = movie.title || movie.name || "Untitled"
                    const year = movie.release_date ? movie.release_date.slice(0, 4) : ""
                    const ticketQuery = encodeURIComponent(`${title}${year ? ` (${year})` : ""} sinema bileti`)
                    const ticketUrl = `https://www.google.com/search?q=${ticketQuery}`

                    return (
                        <div key={movie.id} className="snap-start shrink-0 w-32 sm:w-40">
                            <Link href={`/movies/${movie.id}?from=1`}
                                className="group block"
                            >
                                <div className="relative aspect-2/3 rounded-xl overflow-hidden border border-[#2d3f55] bg-[#1e293b]">
                                    <img src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                        alt={title}
                                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-200"
                                    />
                                </div>
                                <h3 className="mt-1.5 text-xs sm:text-sm font-medium text-slate-100 line-clamp-1 leading-snug">
                                    {title}
                                </h3>
                                <p className="text-[11px] text-indigo-400 font-semibold">
                                    ★ {movie.vote_average?.toFixed(1) || "-"}
                                </p>
                            </Link>

                            <Link href={ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 block text-center text-[11px] sm:text-xs font-semibold bg-indigo-400 text-[#0f172a] rounded-lg py-1.5 hover:bg-indigo-300 active:scale-[0.97] transition-all">
                                Buy Ticket
                            </Link>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}