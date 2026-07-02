"use client"

// https://developer.themoviedb.org/reference/discover-movie
import { useEffect, useState } from "react"

interface SortMenuProps {
    currentFilters: string;
    currentGenre: string;
    type: "movies" | "tv"
}

export const movieGenres = [
    { value: "28", label: "Action" },
    { value: "35", label: "Comedy" },
    { value: "80", label: "Crime" },
    { value: "9648", label: "Mystery" },
    { value: "18", label: "Drama" },
    { value: "10749", label: "Romance" },
    { value: "12", label: "Adventure" },
    { value: "27", label: "Horror" },
    { value: "53", label: "Thriller" },
    { value: "878", label: "Sci-Fi" },
    { value: "14", label: "Fantasy" },
    { value: "10402", label: "Music" },
    { value: "36", label: "History" },
    { value: "99", label: "Documentary" },
    { value: "10751", label: "Family" },
    { value: "16", label: "Animation" },
]

export const tvGenres = [
    { value: "10759", label: "Action & Adventure" },
    { value: "35", label: "Comedy" },
    { value: "80", label: "Crime" },
    { value: "9648", label: "Mystery" },
    { value: "18", label: "Drama" },
    { value: "36", label: "History" },
    { value: "99", label: "Documentary" },
    { value: "10751", label: "Family" },
    { value: "16", label: "Animation" },
    { value: "10765", label: "Sci-Fi & Fantasy" },
    { value: "10766", label: "Soap" },
    { value: "10767", label: "Talk" },
    { value: "10764", label: "Reality" },
    { value: "10768", label: "War & Politics" },
    { value: "10763", label: "News" },
    { value: "10762", label: "Kids" },
]

export const profileGenres = Array.from(
    new Set([...movieGenres, ...tvGenres].map((genre) => genre.label))
)

export default function SortMenu({ currentFilters, currentGenre, type = "movies" }: SortMenuProps) {
    const isMovie = type === "movies"
    const genres = isMovie ? movieGenres : tvGenres
    const [selectedGenres, setSelectedGenres] = useState<string[]>(currentGenre.split(",").filter(Boolean))
    const selectedGenreLabels = selectedGenres
        .map((genreValue) => genres.find((genre) => genre.value === genreValue)?.label)
        .filter(Boolean)

    useEffect(() => {
        setSelectedGenres(currentGenre.split(",").filter(Boolean))
    }, [currentGenre])

    function updateGenres(genreValue: string) {
        const nextGenres = selectedGenres.includes(genreValue)
            ? selectedGenres.filter((value) => value !== genreValue)
            : [...selectedGenres, genreValue]

        setSelectedGenres(nextGenres)
    }

    function clearGenres() {
        setSelectedGenres([])
    }

    return (
        <form action={`/${type}`} method="GET" className="flex flex-col md:flex-row gap-3 w-full">            
            {/* filter by genre */}
            <div className="w-full md:w-48 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Genre
                    </p>
                    {selectedGenres.length > 0 && (
                        <button
                            type="button"
                            onClick={clearGenres}
                            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <input type="hidden" name="genre" value={selectedGenres.join(",")} readOnly />
                <details className="group relative">
                    <summary className="flex w-full list-none items-center justify-between gap-3 rounded-xl border border-[#2d3f55] bg-[#0f172a] px-3 py-2 text-left text-sm text-slate-100 transition-colors hover:border-indigo-400/70 cursor-pointer [&::-webkit-details-marker]:hidden">
                        <span className="truncate">
                        {selectedGenres.length === 0
                            ? "All Genres"
                            : selectedGenres.length === 1
                                ? selectedGenreLabels[0]
                                : `${selectedGenres.length} genres selected`}
                        </span>
                        <span className="text-slate-500">⌄</span>
                    </summary>
                    <div className="absolute left-0 right-0 top-full z-80 mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#2d3f55] bg-[#0f172a] p-2 shadow-2xl">
                        {genres.map((genre) => (
                            <label
                                key={genre.value}
                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-[#1e293b] cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedGenres.includes(genre.value)}
                                    onChange={() => updateGenres(genre.value)}
                                    className="accent-indigo-400"
                                />
                                <span>{genre.label}</span>
                            </label>
                        ))}
                        <button
                            type="button"
                            onClick={(e) => e.currentTarget.form?.requestSubmit()}
                            className="mt-2 w-full rounded-lg bg-indigo-400 px-3 py-2 text-xs font-bold text-[#0f172a] transition-colors hover:bg-indigo-300 cursor-pointer"
                        >
                            Apply Genres
                        </button>
                    </div>
                </details>
            </div>

            {/* sort by */}
            <div className="w-full md:w-55 flex flex-col gap-1.5">
                <label htmlFor="sort-by" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sort By
                </label>
                <select name="sort" id="sort-by" value={currentFilters || ""}
                    onChange={(e) => e.target.form?.submit()}
                    className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                    <option value="popularity.desc">Popularity (High to Low)</option>
                    <option value="vote_average.desc">Rating (High to Low)</option>
                    <option value="vote_average.asc">Rating (Low to High)</option>
                    <option value={isMovie ? "primary_release_date.desc" : "first_air_date.desc"}>Release Date (Newest)</option>
                    <option value={isMovie ? "primary_release_date.asc" : "first_air_date.asc"}>Release Date (Oldest)</option>
                </select>
            </div>
        </form>
    )
}