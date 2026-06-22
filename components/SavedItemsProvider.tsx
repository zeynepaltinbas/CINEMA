"use client"

import { supabase } from "@/lib/supabase"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "./AuthProvider"
import { useNotification } from "./NotificationProvider"

export type MediaType = "movie" | "tv"
export type ListType = "favourites" | "watchlist"

export interface SavedItem {
    id: number;
    media_id: number;
    media_type: MediaType;
    list_type: ListType;
    item: Record<string, unknown>;
    created_at: string;
}

interface ToggleSavedItem {
    mediaId: number;
    mediaType: MediaType;
    listType: ListType;
    item: Record<string, unknown>;
}

interface SavedItemsContextValue {
    isSavedItemsLoading: boolean;
    isSaved: (mediaId: number, mediaType: MediaType, listType: ListType) => boolean;
    isPending: (mediaId: number, mediaType: MediaType, listType: ListType) => boolean;
    getSavedItems: (listType: ListType) => SavedItem[];
    toggleSavedItem: (savedItem: ToggleSavedItem) => Promise<void>;
}

const SavedItemsContext = createContext<SavedItemsContextValue | undefined>(undefined)

function createSavedItemKey(mediaId: number, mediaType: MediaType, listType: ListType) {
    return `${mediaType}:${mediaId}:${listType}`
}

export function SavedItemsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const { showNotification } = useNotification()
    const [savedItems, setSavedItems] = useState<SavedItem[]>([])
    const [pendingKeys, setPendingKeys] = useState<string[]>([])
    const [isSavedItemsLoading, setIsSavedItemsLoading] = useState(false)

    useEffect(() => {
        let isMounted = true
        setSavedItems([])

        if (!user) {
            setIsSavedItemsLoading(false)
            return
        }

        setIsSavedItemsLoading(true)

        supabase
            .from("saved_items")
            .select("id, media_id, media_type, list_type, item, created_at")
            .then(({ data, error }) => {
                if (!isMounted) return

                if (error) {
                    showNotification(error.message)
                    setIsSavedItemsLoading(false)
                    return
                }

                setSavedItems((data ?? []) as SavedItem[])
                setIsSavedItemsLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [user, showNotification])

    const isSaved = useCallback((mediaId: number, mediaType: MediaType, listType: ListType) => {
        return savedItems.some((savedItem) =>
            savedItem.media_id === mediaId
            && savedItem.media_type === mediaType
            && savedItem.list_type === listType
        )
    }, [savedItems])

    const isPending = useCallback((mediaId: number, mediaType: MediaType, listType: ListType) => {
        return pendingKeys.includes(createSavedItemKey(mediaId, mediaType, listType))
    }, [pendingKeys])

    const getSavedItems = useCallback((listType: ListType) => {
        return savedItems
            .filter((savedItem) => savedItem.list_type === listType)
            .sort((firstItem, secondItem) => secondItem.created_at.localeCompare(firstItem.created_at))
    }, [savedItems])

    const toggleSavedItem = useCallback(async ({ mediaId, mediaType, listType, item }: ToggleSavedItem) => {
        if (!user) {
            showNotification(`You need to be signed in to add items to your ${listType}.`)
            return
        }

        const key = createSavedItemKey(mediaId, mediaType, listType)

        if (pendingKeys.includes(key)) return
        setPendingKeys((currentKeys) => [...currentKeys, key])

        const existingItem = savedItems.find((savedItem) =>
            savedItem.media_id === mediaId
            && savedItem.media_type === mediaType
            && savedItem.list_type === listType
        )

        if (existingItem) {
            const { error } = await supabase
                .from("saved_items")
                .delete()
                .eq("id", existingItem.id)

            if (error) {
                showNotification(error.message)
            } else {
                setSavedItems((currentItems) => currentItems.filter((savedItem) => savedItem.id !== existingItem.id))
                showNotification(`Removed from ${listType}.`)
            }
        } else {
            const { data, error } = await supabase
                .from("saved_items")
                .insert({
                    media_id: mediaId,
                    media_type: mediaType,
                    list_type: listType,
                    item,
                })
                .select("id, media_id, media_type, list_type, item, created_at")
                .single()

            if (error) {
                showNotification(error.message)
            } else {
                setSavedItems((currentItems) => [...currentItems, data as SavedItem])
                showNotification(`Added to ${listType}.`)
            }
        }

        setPendingKeys((currentKeys) => currentKeys.filter((pendingKey) => pendingKey !== key))
    }, [pendingKeys, savedItems, showNotification, user])

    return (
        <SavedItemsContext.Provider value={{ isSavedItemsLoading, isSaved, isPending, getSavedItems, toggleSavedItem }}>
            {children}
        </SavedItemsContext.Provider>
    )
}

export function useSavedItems() {
    const context = useContext(SavedItemsContext)

    if (!context) {
        throw new Error("useSavedItems must be used inside SavedItemsProvider")
    }

    return context
}
