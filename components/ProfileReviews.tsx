"use client"

import { supabase } from "@/lib/supabase"
import { getFriendlyErrorMessage } from "@/lib/errorMessages"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useNotification } from "./NotificationProvider"

type MediaType = "movie" | "tv"

interface MediaReview {
    id: string;
    media_id: number;
    media_type: MediaType;
    rating: number;
    comment: string | null;
    item: Record<string, unknown>;
    updated_at: string;
}

interface ProfileReviewsProps {
    userId: string;
}

function getItemTitle(item: Record<string, unknown>) {
    return typeof item.title === "string"
        ? item.title
        : typeof item.name === "string"
            ? item.name
            : "Untitled"
}

function getItemYear(item: Record<string, unknown>) {
    const date = typeof item.release_date === "string"
        ? item.release_date
        : typeof item.first_air_date === "string"
            ? item.first_air_date
            : ""

    return date ? date.slice(0, 4) : ""
}

function getPosterPath(item: Record<string, unknown>) {
    return typeof item.poster_path === "string" ? item.poster_path : ""
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date))
}

export default function ProfileReviews({ userId }: ProfileReviewsProps) {
    const { showNotification } = useNotification()
    const [reviews, setReviews] = useState<MediaReview[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [deletingId, setDeletingId] = useState("")

    useEffect(() => {
        let isMounted = true

        setIsLoading(true)
        setError("")

        supabase
            .from("media_reviews")
            .select("id, media_id, media_type, rating, comment, item, updated_at")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
            .then(({ data, error: reviewsError }) => {
                if (!isMounted) return

                if (reviewsError) {
                    setError(getFriendlyErrorMessage(reviewsError, "Could not load your reviews. Please try again."))
                    setIsLoading(false)
                    return
                }

                setReviews((data ?? []) as MediaReview[])
                setIsLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [userId])

    async function deleteReview(reviewId: string) {
        setDeletingId(reviewId)
        setError("")

        const { error: deleteError } = await supabase
            .from("media_reviews")
            .delete()
            .eq("id", reviewId)

        setDeletingId("")

        if (deleteError) {
            setError(getFriendlyErrorMessage(deleteError, "Could not delete this review. Please try again."))
            return
        }

        setReviews((currentReviews) => currentReviews.filter((review) => review.id !== reviewId))
        showNotification("Review deleted.")
    }

    return (
        <section className="mt-5 bg-[#1e293b] border border-[#2d3f55] rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-100">Ratings & comments</h2>
                    <p className="text-sm text-slate-400 mt-1">Movies and TV series you reviewed.</p>
                </div>
                <span className="text-xs font-bold text-indigo-400">{reviews.length}</span>
            </div>

            {isLoading ? (
                <p className="text-sm text-slate-400 mt-5">Loading reviews...</p>
            ) : error ? (
                <p className="text-sm text-red-400 mt-5">{error}</p>
            ) : reviews.length === 0 ? (
                <p className="text-sm text-slate-500 mt-5">No ratings yet.</p>
            ) : (
                <div className="mt-5 grid gap-3">
                    {reviews.map((review) => {
                        const title = getItemTitle(review.item)
                        const year = getItemYear(review.item)
                        const posterPath = getPosterPath(review.item)
                        const href = review.media_type === "movie"
                            ? `/movies/${review.media_id}?returnTo=/profile`
                            : `/tv/${review.media_id}?returnTo=/profile`

                        return (
                            <div
                                key={review.id}
                                className="flex gap-3 rounded-xl bg-[#0f172a] border border-[#2d3f55] p-3 hover:border-indigo-400/60 transition-colors"
                            >
                                <Link href={href} className="flex gap-3 min-w-0 flex-1">
                                    <div className="w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-[#1e293b] border border-[#2d3f55]">
                                        {posterPath ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${posterPath}`}
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
                                        <p className="text-xs font-bold text-indigo-400 mt-1">Your rating: {review.rating}/10</p>
                                        <p className="text-[11px] text-slate-500 mt-1">Reviewed {formatDate(review.updated_at)}</p>
                                        {review.comment && (
                                            <p className="text-sm text-slate-300 mt-2 line-clamp-2">{review.comment}</p>
                                        )}
                                    </div>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => deleteReview(review.id)}
                                    disabled={deletingId === review.id}
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