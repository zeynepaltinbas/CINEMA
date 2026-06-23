"use client"

// https://developer.themoviedb.org/reference/discover-movie

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

    return (
        <form action={`/${type}`} method="GET" className="flex flex-col md:flex-row gap-3 w-full">            
            {/* filter by genre */}
            <div className="w-full md:w-48 flex flex-col gap-1.5">
                <label htmlFor="genre-filter" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Genre
                </label>
                <select name="genre" id="genre-filter" value={currentGenre || ""} 
                    // e: the event object
                    // target: the HTML element that triggered the event
                    // form? : if the form cannot be found for some reason, do not crash the website
                    // submit(): submit the form immediately, even without a submit button
                    onChange={(e) => e.target.form?.submit()}
                    className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                        <option key={genre.value} value={genre.value}>
                            {genre.label}
                        </option>
                    ))}
                </select>
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