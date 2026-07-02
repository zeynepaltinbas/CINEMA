"use client"

import Link from "next/link"
import { movieGenres, tvGenres } from "@/components/SortMenu"

interface SelectedFiltersProps {
    searchQuery: string;
    currentSort: string;
    currentGenre: string;
    currentTab?: string;
    type: "movies" | "tv";
}

const sortLabels: Record<string, string> = {
    "popularity.desc": "Popular",
    "vote_average.desc": "Highest rated",
    "vote_average.asc": "Lowest rated",
    "primary_release_date.desc": "Newest",
    "primary_release_date.asc": "Oldest",
    "first_air_date.desc": "Newest",
    "first_air_date.asc": "Oldest",
}

function buildHref(type: "movies" | "tv", params: Record<string, string>) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value)
    })

    const queryString = searchParams.toString()
    return queryString ? `/${type}?${queryString}` : `/${type}`
}

export default function SelectedFilters({ searchQuery, currentSort, currentGenre, currentTab = "popular", type }: SelectedFiltersProps) {
    const genres = type === "movies" ? movieGenres : tvGenres
    const selectedGenreValues = currentGenre.split(",").filter(Boolean)
    const selectedGenres = selectedGenreValues
        .map((genreValue) => genres.find((genre) => genre.value === genreValue))
        .filter(Boolean)
    const shouldShowSort = currentSort && currentSort !== "popularity.desc"
    const hasFilters = searchQuery || selectedGenres.length > 0 || shouldShowSort

    if (!hasFilters) return null

    const baseParams = {
        query: searchQuery,
        sort: currentSort,
        genre: currentGenre,
        tab: currentTab !== "popular" ? currentTab : "",
    }

    return (
        <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</span>

            {searchQuery && (
                <Link
                    href={buildHref(type, { ...baseParams, query: "" })}
                    className="rounded-full border border-[#2d3f55] bg-[#1e293b] px-3 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-indigo-400/60 hover:text-slate-100"
                >
                    Search: {searchQuery} x
                </Link>
            )}

            {selectedGenres.map((genre) => {
                if (!genre) return null

                const nextGenres = selectedGenreValues.filter((genreValue) => genreValue !== genre.value).join(",")

                return (
                    <Link
                        key={genre.value}
                        href={buildHref(type, { ...baseParams, genre: nextGenres })}
                        className="rounded-full border border-indigo-400/40 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200 transition-colors hover:bg-indigo-400/20"
                    >
                        {genre.label} x
                    </Link>
                )
            })}

            {shouldShowSort && (
                <Link
                    href={buildHref(type, { ...baseParams, sort: "popularity.desc" })}
                    className="rounded-full border border-[#d11c7f]/40 bg-[#d11c7f]/10 px-3 py-1 text-xs font-semibold text-[#f2a4cf] transition-colors hover:bg-[#d11c7f]/20"
                >
                    {sortLabels[currentSort] || "Custom sort"} x
                </Link>
            )}

            <Link
                href={buildHref(type, { tab: currentTab !== "popular" ? currentTab : "" })}
                className="text-xs font-bold text-slate-500 transition-colors hover:text-slate-200"
            >
                Clear all
            </Link>
        </div>
    )
}