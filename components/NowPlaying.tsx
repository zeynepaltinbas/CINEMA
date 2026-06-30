"use client"
import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

interface NowPlayingStripProps {
    movies: any[];
}

export default function NowPlayingStrip({ movies }: NowPlayingStripProps) {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsTooltipOpen(false)
            }
        }

        if (isTooltipOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isTooltipOpen])

    if (!movies || movies.length === 0) 
        return null

    const uniqueMovies = movies.filter((movie, index, movieList) => {
        return movieList.findIndex((currentMovie) => currentMovie.id === movie.id) === index
    })

    const filteredMovies = uniqueMovies.filter((movie) => {
        const title = movie.title || movie.name || ""
        return title.toLowerCase().includes(searchTerm.toLowerCase())
    })

    function scrollMovies(direction: "left" | "right") {
        if (!scrollRef.current) return

        const scrollAmount = scrollRef.current.clientWidth * 0.8
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        })
    }

    return (
        <section className="mb-5 border-b border-[#2d3f55] pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 relative">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                        Now Playing in TR
                    </h2>

                    <div 
                        ref={tooltipRef}
                        onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                        className="group/tooltip relative inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-500 text-slate-400 hover:text-indigo-400 hover:border-indigo-400 transition-colors text-[10px] select-none font-bold cursor-pointer"
                    >
                        ?
                        <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 w-56 sm:w-64 bg-[#1e293b] border border-[#2d3f55] text-slate-300 text-[11px] sm:text-xs p-2.5 rounded-xl shadow-2xl transition-opacity duration-200 z-50 leading-relaxed font-normal ${
                            isTooltipOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto"
                        }`}>
                            Some festival or indie movies may not have ticket or screening information available in local theaters.
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1e293b]" />
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => scrollMovies("left")}
                            className="w-8 h-8 grid place-items-center bg-[#1e293b] border border-[#2d3f55] text-slate-300 hover:text-indigo-400 hover:border-indigo-400/60 rounded-lg transition-colors cursor-pointer"
                            aria-label="Scroll now playing left"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollMovies("right")}
                            className="w-8 h-8 grid place-items-center bg-[#1e293b] border border-[#2d3f55] text-slate-300 hover:text-indigo-400 hover:border-indigo-400/60 rounded-lg transition-colors cursor-pointer"
                            aria-label="Scroll now playing right"
                        >
                            ›
                        </button>
                    </div>

                    <div className="flex-1 sm:w-48">
                        <input
                            type="text"
                            placeholder="Search in Now Playing..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1e293b] border border-[#2d3f55] rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* horizontal scroll strip */}
            {filteredMovies.length > 0 ? (
                <div ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none" }}
                >
                    {filteredMovies.map((movie) => {
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
                                        <img src={`${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}`}
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
                                    className="mt-1.5 block text-center text-[11px] sm:text-xs font-semibold bg-indigo-400 text-[#0f172a] rounded-lg py-1.5 hover:bg-indigo-300 active:scale-[0.97] transition-all cursor-pointer">
                                    Buy Ticket
                                </Link>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-slate-500 text-sm py-8 text-center">No matching movies in current list.</p>
            )}
        </section>
    )
}