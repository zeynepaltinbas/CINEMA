"use client"

import { useState } from "react"
import ShowBox from "./ShowBox"
import { useAuth } from "./AuthProvider"
import { useSavedItems } from "./SavedItemsProvider"
import type { ListType } from "./SavedItemsProvider"

interface SavedItemsPageProps {
    listType: ListType;
    title: string;
}

export default function SavedItemsPage({ listType, title }: SavedItemsPageProps) {
    const { user, isAuthLoading } = useAuth()
    const { getSavedItems, isSavedItemsLoading } = useSavedItems()
    const [searchTerm, setSearchTerm] = useState("")
    const savedItems = getSavedItems(listType)
    const filteredItems = savedItems.filter((savedItem) => {
        const itemTitle = typeof savedItem.item.title === "string"
            ? savedItem.item.title
            : typeof savedItem.item.name === "string"
                ? savedItem.item.name
                : ""

        return itemTitle.toLowerCase().includes(searchTerm.trim().toLowerCase())
    })

    if (isAuthLoading || isSavedItemsLoading) {
        return (
            <main className="min-h-screen px-4 max-w-7xl mx-auto py-10">
                <p className="text-slate-400">Loading...</p>
            </main>
        )
    }

    if (!user) {
        return (
            <main className="min-h-screen px-4 max-w-7xl mx-auto py-10">
                <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
                <p className="text-slate-400 mt-3">Sign in to view your {listType}.</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen px-4 max-w-7xl mx-auto py-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
                <div className="w-full sm:w-56">
                    <input
                        type="text"
                        placeholder={`Search in ${title}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1e293b] border border-[#2d3f55] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                </div>
            </div>

            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredItems.map((savedItem) => (
                        <ShowBox
                            key={savedItem.id}
                            show={savedItem.item}
                            currentPage={1}
                            searchQuery=""
                            currentSort=""
                            currentGenre=""
                            type={savedItem.media_type === "movie" ? "movies" : "tv"}
                            returnTo={listType === "favourites" ? "/favourites" : "/watchlist"}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center py-20 text-lg">
                    {savedItems.length === 0
                        ? `Your ${listType} is empty.`
                        : `No matching items in ${title.toLowerCase()}.`}
                </p>
            )}
        </main>
    )
}