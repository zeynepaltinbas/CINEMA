"use client"

// https://developer.themoviedb.org/reference/discover-movie

interface SortMenuProps {
    currentFilters: string;
    currentGenre: string;
    type: "movies" | "tv"
}

export default function SortMenu({ currentFilters, currentGenre, type = "movies" }: SortMenuProps) {
    const isMovie = type === "movies"
    return (
        <form action={`/${type}`} method="GET" className="flex flex-row gap-4 bg-[#1e293b] border border-[#2d3f55] p-3.5 rounded-2xl w-max">            {/* filter by genre */}
            <div className="w-48 flex flex-col gap-1.5">
                <label htmlFor="genre-filter" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Genre
                </label>
                <select name="genre" id="genre-filter" value={currentGenre} 
                    // e: the event object
                    // target: the HTML element that triggered the event
                    // form? : if the form cannot be found for some reason, do not crash the website
                    // submit(): submit the form immediately, even without a submit button
                    onChange={(e) => e.target.form?.submit()}
                    className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                    <option value="">All Genres</option>
                    
                    {/* same for both */}
                    <option value={isMovie ? "28" : "10759"}>{isMovie ? "Action" : "Action & Adventure"}</option>
                    <option value="35">Comedy</option>
                    <option value="80">Crime</option>
                    <option value="9648">Mystery</option>
                    <option value="18">Drama</option>
                    
                    {/* only in movies */}
                    {isMovie && (
                        <>
                            <option value="10749">Romance</option>
                            <option value="12">Adventure</option>
                            <option value="27">Horror</option>
                            <option value="53">Thriller</option>
                            <option value="878">Sci-Fi</option>
                            <option value="14">Fantasy</option>
                            <option value="10402">Music</option>
                        </>
                    )}

                    {/* in both */}
                    <option value="36">History</option>
                    <option value="99">Documentary</option>
                    <option value="10751">Family</option>
                    <option value="16">Animation</option>

                    {/* only in tv series */}
                    {!isMovie && (
                        <>
                            <option value="10765">Sci-Fi & Fantasy</option>
                            <option value="10766">Soap</option>
                            <option value="10767">Talk</option>
                            <option value="10764">Reality</option>
                            <option value="10768">War & Politics</option>
                            <option value="10763">News</option>
                            <option value="10762">Kids</option>
                        </>
                    )}
                </select>
            </div>

            {/* sort by */}
            <div className="w-55 flex flex-col gap-1.5">
                <label htmlFor="sort-by" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sort By
                </label>
                <select name="sort" id="sort-by" value={currentFilters}
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