"use client"

import { supabase } from "@/lib/supabase"
import { useCallback, useEffect, useState } from "react"

type MediaType = "movie" | "tv"

interface MediaReviewsListProps {
    mediaId: number;
    mediaType: MediaType;
}

interface PublicReview {
    id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    updated_at: string;
}

interface PublicProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date))
}

function getReviewerName(profile: PublicProfile | undefined) {
    const firstName = profile?.first_name?.trim() || ""
    const lastName = profile?.last_name?.trim() || ""

    if (firstName && lastName) {
        return `${firstName} ${lastName.charAt(0).toUpperCase()}.`
    }

    return firstName || "User"
}

export default function MediaReviewsList({ mediaId, mediaType }: MediaReviewsListProps) {
    const [reviews, setReviews] = useState<PublicReview[]>([])
    const [profilesById, setProfilesById] = useState<Record<string, PublicProfile>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const loadReviews = useCallback(async () => {
        setIsLoading(true)
        setError("")

        const { data, error: reviewsError } = await supabase
            .from("media_reviews")
            .select("id, user_id, rating, comment, updated_at")
            .eq("media_id", mediaId)
            .eq("media_type", mediaType)
            .order("updated_at", { ascending: false })

        if (reviewsError) {
            setError(reviewsError.message)
            setIsLoading(false)
            return
        }

        const nextReviews = (data ?? []) as PublicReview[]
        const userIds = Array.from(new Set(nextReviews.map((review) => review.user_id)))

        if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
                .from("public_profiles")
                .select("id, first_name, last_name")
                .in("id", userIds)

            if (profilesError) {
                setError(profilesError.message)
                setIsLoading(false)
                return
            }

            setProfilesById(
                ((profilesData ?? []) as PublicProfile[]).reduce<Record<string, PublicProfile>>((profilesMap, profile) => {
                    profilesMap[profile.id] = profile
                    return profilesMap
                }, {})
            )
        } else {
            setProfilesById({})
        }

        setReviews(nextReviews)
        setIsLoading(false)
    }, [mediaId, mediaType])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    useEffect(() => {
        function handleReviewChange(event: Event) {
            const customEvent = event as CustomEvent<{ mediaId: number; mediaType: MediaType }>

            if (customEvent.detail?.mediaId === mediaId && customEvent.detail?.mediaType === mediaType) {
                loadReviews()
            }
        }

        window.addEventListener("media-review-change", handleReviewChange)

        return () => {
            window.removeEventListener("media-review-change", handleReviewChange)
        }
    }, [loadReviews, mediaId, mediaType])

    return (
        <section className="mt-5 bg-[#1e293b] border border-[#2d3f55] rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-100">Community reviews</h2>
                    <p className="text-sm text-slate-400 mt-1">What other viewers thought.</p>
                </div>
                <span className="text-xs font-bold text-indigo-400">{reviews.length}</span>
            </div>

            {isLoading ? (
                <p className="text-sm text-slate-400 mt-5">Loading reviews...</p>
            ) : error ? (
                <p className="text-sm text-red-400 mt-5">{error}</p>
            ) : reviews.length === 0 ? (
                <p className="text-sm text-slate-500 mt-5">No public reviews yet.</p>
            ) : (
                <div className="mt-5 grid gap-3">
                    {reviews.map((review) => (
                        <article key={review.id} className="rounded-xl bg-[#0f172a] border border-[#2d3f55] p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-slate-100">{getReviewerName(profilesById[review.user_id])}</p>
                                    <p className="text-xs font-bold text-indigo-400 mt-0.5">{review.rating}/10</p>
                                </div>
                                <p className="text-[11px] text-slate-500">{formatDate(review.updated_at)}</p>
                            </div>
                            {review.comment ? (
                                <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">{review.comment}</p>
                            ) : (
                                <p className="text-sm text-slate-500 mt-2">No comment.</p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}