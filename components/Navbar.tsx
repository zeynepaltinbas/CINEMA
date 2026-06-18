"use client"
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import SortMenu from "./SortMenu";

export default function Navbar() {
    const pathname = usePathname() // returns "/movies", "/tv" or "/"
    const searchParams = useSearchParams()

    const searchQuery = searchParams.get("query") || ""
    const currentSort = searchParams.get("sort") || "popularity.desc"
    const currentGenre = searchParams.get("genre") || ""

    const isSortAvailable = !searchQuery
    const [isOpen, setIsOpen] = useState(false)

    const isMoviePage = pathname.startsWith("/movies")
    const isTvPage = pathname.startsWith("/tv")
    
    const placeholder = isTvPage ? "Search for a TV Show..." : "Search for a Movie..."

    return (
        <header className="border-b border-[#2d3f55] bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
                <Link href="/" className="text-base sm:text-xl font-bold tracking-wider text-slate-100 hover:text-indigo-400 transition-colors uppercase shrink-0">
                    CINEMA
                </Link>

                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    <Link href="/movies" 
                        className={`text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            isMoviePage ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                        }`}>
                        Movies
                    </Link>
                    <Link href="/tv" 
                        className={`text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            isTvPage ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                        }`}>
                        TV Series
                    </Link>
                </div>

                {/* search & sort */}
                <div className="flex-1 max-w-md relative mx-2 sm:mx-4">
                    <div className="flex gap-2 w-full">
                        <form action={pathname} method="GET" className="flex gap-2 flex-1">
                            <input
                                type="text"
                                name="query"
                                placeholder={placeholder}
                                defaultValue={searchQuery}
                                className="w-full bg-[#1e293b] border border-[#2d3f55] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                            />
                            <button
                                type="submit"
                                className="bg-indigo-400 text-[#0f172a] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-300 transition-colors cursor-pointer"
                            >
                                Search
                            </button>
                        </form>

                        {/* filter button */}
                        {(isMoviePage || isTvPage) && (
                            <button
                                onClick={() => isSortAvailable && setIsOpen(!isOpen)}
                                className={`flex items-center justify-center px-2.5 border rounded-lg transition-all text-xs font-semibold select-none ${
                                    isSortAvailable 
                                        ? "bg-[#1e293b] border-[#2d3f55] text-indigo-400 hover:border-indigo-400/60 cursor-pointer pointer-events-auto" 
                                        : "bg-[#1e293b]/40 border-[#2d3f55]/30 text-slate-600 pointer-events-none"
                                }`}
                            >
                                Filter
                            </button>
                        )}
                    </div>

                    {/* dropdown filter menu */}
                    <div className={`absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-[#2d3f55] rounded-xl shadow-2xl p-3.5 grid transition-[grid-template-rows,opacity] duration-300 ease-in-out overflow-hidden z-50 ${
                        isOpen && isSortAvailable ? "grid-rows-[1fr] opacity-100 visible" : "grid-rows-[0fr] opacity-0 invisible"
                    }`}>
                        <div className="min-h-0">
                            <div className="w-full flex justify-center">
                                <SortMenu
                                    currentFilters={currentSort}
                                    currentGenre={currentGenre}
                                    type={isTvPage ? "tv" : "movies"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Link href="/" className="bg-[#1e293b] border border-[#2d3f55] hover:bg-[#2d3f55] text-slate-100 font-medium px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shrink-0">
                    Sign in
                </Link>
            </div>
        </header>
    )
}