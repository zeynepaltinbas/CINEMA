"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"
import { useNotification } from "./NotificationProvider"
import { useSavedItems } from "./SavedItemsProvider"
import { useEffect, useState } from "react"
import type { SubmitEvent } from "react"

type MediaType = "movie" | "tv"

interface MediaReviewFormProps {
    mediaId: number;
    mediaType: MediaType;
    item: Record<string, unknown>;
}

interface Review {
    id: string;
    rating: number;
    comment: string | null;
}

const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function MediaReviewForm({ mediaId, mediaType, item }: MediaReviewFormProps) {
    const { user, isAuthLoading } = useAuth()
    const { showNotification } = useNotification()
    const { isSaved, isPending, toggleSavedItem } = useSavedItems()
    const [review, setReview] = useState<Review | null>(null)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const isWatched = isSaved(mediaId, mediaType, "watched")
    const watchedIsPending = isPending(mediaId, mediaType, "watched")

    useEffect(() => {
        let isMounted = true

        async function loadReview() {
            setReview(null)
            setRating(0)
            setComment("")

            if (!user) return

            setIsLoading(true)
            setError("")

            const { data, error: reviewError } = await supabase
                .from("media_reviews")
                .select("id, rating, comment")
                .eq("user_id", user.id)
                .eq("media_id", mediaId)
                .eq("media_type", mediaType)
                .maybeSingle()

            if (!isMounted) return

            if (reviewError) {
                setError(reviewError.message)
                setIsLoading(false)
                return
            }

            if (data) {
                setReview(data as Review)
                setRating(data.rating)
                setComment(data.comment ?? "")
            }

            setIsLoading(false)
        }

        loadReview()

        return () => {
            isMounted = false
        }
    }, [mediaId, mediaType, user])

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!user) {
            showNotification("Sign in to rate and comment.")
            return
        }

        if (rating < 1 || rating > 10) {
            setError("Choose a rating from 1 to 10.")
            return
        }

        setIsSaving(true)
        setError("")

        const { data, error: saveError } = await supabase
            .from("media_reviews")
            .upsert({
                user_id: user.id,
                media_id: mediaId,
                media_type: mediaType,
                rating,
                comment: comment.trim() || null,
                item,
            }, {
                onConflict: "user_id,media_type,media_id",
            })
            .select("id, rating, comment")
            .single()

        setIsSaving(false)

        if (saveError) {
            setError(saveError.message)
            return
        }

        setReview(data as Review)
        setComment(data.comment ?? "")
        window.dispatchEvent(new CustomEvent("media-review-change", {
            detail: { mediaId, mediaType },
        }))
        showNotification(review ? "Review updated." : "Review saved.")
    }

    async function handleDelete() {
        if (!review) return

        setIsSaving(true)
        setError("")

        const { error: deleteError } = await supabase
            .from("media_reviews")
            .delete()
            .eq("id", review.id)

        setIsSaving(false)

        if (deleteError) {
            setError(deleteError.message)
            return
        }

        setReview(null)
        setRating(0)
        setComment("")
        window.dispatchEvent(new CustomEvent("media-review-change", {
            detail: { mediaId, mediaType },
        }))
        showNotification("Review deleted.")
    }

    async function handleMarkWatched() {
        await toggleSavedItem({
            mediaId,
            mediaType,
            listType: "watched",
            item,
        })
    }

    if (isAuthLoading || isLoading) {
        return (
            <section className="mt-8 bg-[#1e293b] border border-[#2d3f55] rounded-xl p-5">
                <p className="text-sm text-slate-400">Loading your review...</p>
            </section>
        )
    }

    return (
        <section className="mt-8 bg-[#1e293b] border border-[#2d3f55] rounded-xl p-5 sm:p-6">
            {!user ? (
                <>
                    <h2 className="text-lg font-bold text-slate-100">Your review</h2>
                    <p className="text-sm text-slate-400 mt-1">Sign in to mark this as watched and add a review.</p>
                </>
            ) : !isWatched ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">Your review</h2>
                        <p className="text-sm text-slate-400 mt-1">Mark this as watched before rating or commenting.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleMarkWatched}
                        disabled={watchedIsPending}
                        className="bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#0f172a] text-sm font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                        {watchedIsPending ? "Saving..." : "✓ Mark watched"}
                    </button>
                </div>
            ) : (
                <>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-100">Your review</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {user ? "Rate it and leave a note for your profile." : "Sign in to add your rating and comment."}
                    </p>
                </div>

                {review && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSaving}
                        className="text-xs font-bold text-red-400 hover:text-red-300 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                        Delete
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                    <p className="block text-xs font-semibold text-slate-400 mb-2">Rating</p>
                    <div className="flex flex-wrap gap-1.5">
                        {ratings.map((ratingValue) => (
                            <button
                                key={ratingValue}
                                type="button"
                                onClick={() => setRating(ratingValue)}
                                disabled={!user}
                                className={`w-8 h-8 grid place-items-center rounded-lg border text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                    rating === ratingValue
                                        ? "bg-indigo-400 border-indigo-400 text-[#0f172a]"
                                        : "bg-[#0f172a] border-[#2d3f55] text-slate-300 hover:border-indigo-400/60 hover:text-indigo-400"
                                }`}
                            >
                                {ratingValue}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Comment
                    </label>
                    <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        disabled={!user}
                        rows={4}
                        maxLength={500}
                        placeholder="What did you think?"
                        className="w-full resize-none bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors disabled:opacity-50"
                    />
                    <p className="mt-1 text-xs text-slate-500 text-right">{comment.length}/500</p>
                </div>

                {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

                <button
                    type="submit"
                    disabled={!user || isSaving}
                    className="bg-[#d11c7f] hover:bg-[#b01368] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#d11c7f]/10"
                >
                    {isSaving ? "Saving..." : review ? "Update review" : "Save review"}
                </button>
            </form>
                </>
            )}
        </section>
    )
}