"use client"

import { useSavedItems } from "./SavedItemsProvider"
import type { ListType, MediaType } from "./SavedItemsProvider"
import type { MediaItem } from "@/types/media"

interface SavedItemButtonsProps {
    show: MediaItem;
    type: "movies" | "tv";
}

export default function SavedItemButtons({ show, type }: SavedItemButtonsProps) {
    const { isSaved, isPending, toggleSavedItem } = useSavedItems()
    const mediaType: MediaType = type === "movies" ? "movie" : "tv"

    const item = {
        id: show.id,
        title: show.title,
        name: show.name,
        poster_path: show.poster_path,
        vote_average: show.vote_average,
        release_date: show.release_date,
        first_air_date: show.first_air_date,
    }

    async function handleToggle(listType: ListType) {
        await toggleSavedItem({
            mediaId: show.id,
            mediaType,
            listType,
            item,
        })
    }

    const favouriteIsSaved = isSaved(show.id, mediaType, "favourites")
    const watchlistIsSaved = isSaved(show.id, mediaType, "watchlist")
    const watchedIsSaved = isSaved(show.id, mediaType, "watched")
    const favouriteIsPending = isPending(show.id, mediaType, "favourites")
    const watchlistIsPending = isPending(show.id, mediaType, "watchlist")
    const watchedIsPending = isPending(show.id, mediaType, "watched")

    return (
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={() => handleToggle("favourites")}
                disabled={favouriteIsPending}
                aria-label={favouriteIsSaved ? "Remove from favourites" : "Add to favourites"}
                aria-pressed={favouriteIsSaved}
                title={favouriteIsSaved ? "Remove from favourites" : "Add to favourites"}
                className={`w-7 h-7 grid place-items-center rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    favouriteIsSaved
                        ? "bg-[#d11c7f] border-[#d11c7f] text-white"
                        : "bg-[#0f172a] border-[#2d3f55] text-slate-400 hover:text-[#d11c7f] hover:border-[#d11c7f]/60"
                }`}
            >
                <span aria-hidden="true" className="text-sm leading-none">
                    {favouriteIsSaved ? "❦" : "♡"} 
                </span>
            </button>

            <button
                type="button"
                onClick={() => handleToggle("watchlist")}
                disabled={watchlistIsPending}
                aria-label={watchlistIsSaved ? "Remove from watchlist" : "Add to watchlist"}
                aria-pressed={watchlistIsSaved}
                title={watchlistIsSaved ? "Remove from watchlist" : "Add to watchlist"}
                className={`w-7 h-7 grid place-items-center rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    watchlistIsSaved
                        ? "bg-indigo-400 border-indigo-400 text-[#0f172a]"
                        : "bg-[#0f172a] border-[#2d3f55] text-slate-400 hover:text-indigo-400 hover:border-indigo-400/60"
                }`}
            >
                <span aria-hidden="true" className="text-sm leading-none">
                    {watchlistIsSaved ? "▣" : "▢"} 
                </span>
            </button>

            <button
                type="button"
                onClick={() => handleToggle("watched")}
                disabled={watchedIsPending}
                aria-label={watchedIsSaved ? "Remove from watched" : "Mark as watched"}
                aria-pressed={watchedIsSaved}
                title={watchedIsSaved ? "Remove from watched" : "Mark as watched"}
                className={`w-7 h-7 grid place-items-center rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    watchedIsSaved
                        ? "bg-emerald-400 border-emerald-400 text-[#0f172a]"
                        : "bg-[#0f172a] border-[#2d3f55] text-slate-400 hover:text-emerald-400 hover:border-emerald-400/60"
                }`}
            >
                <span aria-hidden="true" className="text-sm leading-none">
                    ✓
                </span>
            </button>
        </div>
    )
}