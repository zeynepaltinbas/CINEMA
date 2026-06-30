"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useSavedItems } from "./SavedItemsProvider"
import { MediaItem } from "@/types/media"

function getItemTitle(item: MediaItem) {
    return typeof item.title === "string"
        ? item.title
        : typeof item.name === "string"
            ? item.name
            : "Untitled"
}

function getItemYear(item: MediaItem) {
    const date = typeof item.release_date === "string"
        ? item.release_date
        : typeof item.first_air_date === "string"
            ? item.first_air_date
            : ""

    return date ? date.slice(0, 4) : ""
}

function getPosterPath(item: MediaItem) {
    if (typeof item.poster_path === "string") return item.poster_path

    const itemRecord = item as unknown as Record<string, unknown>
    return typeof itemRecord.posterPath === "string" ? itemRecord.posterPath : ""
}

function getPosterUrl(posterPath: string) {
    if (!posterPath) return ""
    return posterPath.startsWith("http")
        ? posterPath
        : `https://image.tmdb.org/t/p/w185${posterPath}`
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date))
}

export default function ProfileWatched() {
    const { getSavedItems, isSavedItemsLoading, isPending, toggleSavedItem } = useSavedItems()
    const watchedItems = getSavedItems("watched")
    const [searchTerm, setSearchTerm] = useState("")
    const filteredWatchedItems = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()

        if (!normalizedSearch) return watchedItems

        return watchedItems.filter((watchedItem) => {
            const title = getItemTitle(watchedItem.item).toLowerCase()
            const year = getItemYear(watchedItem.item)

            return title.includes(normalizedSearch) || year.includes(normalizedSearch)
        })
    }, [searchTerm, watchedItems])

    return (
        <section className="mt-5 bg-[#1e293b] border border-[#2d3f55] rounded-xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-100">Watched</h2>
                    <p className="text-sm text-slate-400 mt-1">Movies and TV series you marked as watched.</p>
                </div>
                <span className="text-xs font-bold text-emerald-400">{watchedItems.length}</span>
            </div>

            {watchedItems.length > 0 && (
                <div className="mt-5">
                    <label className="sr-only" htmlFor="watched-search">Search watched</label>
                    <input
                        id="watched-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search watched titles"
                        className="w-full rounded-xl border border-[#2d3f55] bg-[#0f172a] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-emerald-400"
                    />
                </div>
            )}

            {isSavedItemsLoading ? (
                <p className="text-sm text-slate-400 mt-5">Loading watched items...</p>
            ) : watchedItems.length === 0 ? (
                <p className="text-sm text-slate-500 mt-5">Nothing marked as watched yet.</p>
            ) : filteredWatchedItems.length === 0 ? (
                <p className="text-sm text-slate-500 mt-5">No watched titles match your search.</p>
            ) : (
                <div className="mt-5 grid gap-3">
                    {filteredWatchedItems.map((watchedItem) => {
                        const title = getItemTitle(watchedItem.item)
                        const year = getItemYear(watchedItem.item)
                        const posterPath = getPosterPath(watchedItem.item)
                        const posterUrl = getPosterUrl(posterPath)
                        const href = watchedItem.media_type === "movie"
                            ? `/movies/${watchedItem.media_id}?returnTo=/profile`
                            : `/tv/${watchedItem.media_id}?returnTo=/profile`

                        return (
                            <div
                                key={watchedItem.id}
                                className="flex gap-3 rounded-xl bg-[#0f172a] border border-[#2d3f55] p-3 hover:border-emerald-400/60 transition-colors"
                            >
                                <Link href={href} className="flex gap-3 min-w-0 flex-1">
                                    <div className="w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-[#1e293b] border border-[#2d3f55]">
                                        {posterUrl ? (
                                            <img
                                                src={posterUrl}
                                                alt={title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center text-[10px] text-slate-500 text-center px-1">
                                                No poster
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{title}</h3>
                                            {year && <span className="text-xs text-slate-500">{year}</span>}
                                        </div>
                                        <p className="text-xs font-bold text-emerald-400 mt-1">
                                            Watched {formatDate(watchedItem.created_at)}
                                        </p>
                                    </div>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => toggleSavedItem({
                                        mediaId: watchedItem.media_id,
                                        mediaType: watchedItem.media_type,
                                        listType: "watched",
                                        item: watchedItem.item,
                                    })}
                                    disabled={isPending(watchedItem.media_id, watchedItem.media_type, "watched")}
                                    className="self-start text-xs font-bold text-red-400 hover:text-red-300 disabled:opacity-60 transition-colors cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}