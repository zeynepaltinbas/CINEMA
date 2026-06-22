import Link from "next/link";
import SavedItemButtons from "./SavedItemButtons";

interface ShowProps {
    show: any;
    currentPage: number;
    searchQuery: string;
    currentSort: string;
    currentGenre: string;
    type?: "movies" | "tv";
    returnTo?: "/favourites" | "/watchlist";
}

export default function ShowBox({ show, currentPage, searchQuery, currentSort, currentGenre, type = "movies", returnTo }:ShowProps) {
    // bc in movies --> title, tv series --> name
    const title = show.title || show.name || "Untitled"
    return (
        <article className="group bg-[#1e293b] border border-[#2d3f55] rounded-xl overflow-hidden hover:scale-[1.03] hover:border-indigo-400/50 transition-all duration-200">
            <Link href={`/${type}/${show.id}?from=${currentPage}${searchQuery ? `&query=${searchQuery}` : ''}${currentSort ? `&sort=${currentSort}` : ''}${currentGenre ? `&genre=${currentGenre}` : ''}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`}>
                <div className="relative aspect-2/3">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <div className="px-2.5 pt-2.5">
                    <h2 className="text-sm font-medium line-clamp-2 leading-snug mb-1 text-slate-100">
                        {title}
                    </h2>
                </div>
            </Link>

            <div className="px-2.5 pb-2.5 flex items-center justify-between gap-2">
                <p className="text-xs text-indigo-400 font-semibold">
                    ★ {show.vote_average?.toFixed(1) || "No rating"}
                </p>
                <SavedItemButtons show={show} type={type} />
            </div>
        </article>
    )
}