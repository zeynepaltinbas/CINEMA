"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"
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

type ReactionType = "like" | "dislike"

interface ReviewReaction {
    review_id: string;
    user_id: string;
    reaction_type: ReactionType;
}

interface ReactionSummary {
    likes: number;
    dislikes: number;
    userReaction: ReactionType | null;
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
    const { user } = useAuth()
    const [reviews, setReviews] = useState<PublicReview[]>([])
    const [profilesById, setProfilesById] = useState<Record<string, PublicProfile>>({})
    const [reactionsByReviewId, setReactionsByReviewId] = useState<Record<string, ReactionSummary>>({})
    const [pendingReactionReviewIds, setPendingReactionReviewIds] = useState<string[]>([])
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

        const reviewIds = nextReviews.map((review) => review.id)

        if (reviewIds.length > 0) {
            const { data: reactionsData, error: reactionsError } = await supabase
                .from("review_reactions")
                .select("review_id, user_id, reaction_type")
                .in("review_id", reviewIds)

            if (reactionsError) {
                setError(reactionsError.message)
                setIsLoading(false)
                return
            }

            const nextReactionsByReviewId = reviewIds.reduce<Record<string, ReactionSummary>>((reactionMap, reviewId) => {
                reactionMap[reviewId] = {
                    likes: 0,
                    dislikes: 0,
                    userReaction: null,
                }

                return reactionMap
            }, {})

            ;((reactionsData ?? []) as ReviewReaction[]).forEach((reaction) => {
                const summary = nextReactionsByReviewId[reaction.review_id]

                if (!summary) return

                if (reaction.reaction_type === "like") {
                    summary.likes += 1
                } else {
                    summary.dislikes += 1
                }

                if (reaction.user_id === user?.id) {
                    summary.userReaction = reaction.reaction_type
                }
            })

            setReactionsByReviewId(nextReactionsByReviewId)
        } else {
            setReactionsByReviewId({})
        }

        setReviews(nextReviews)
        setIsLoading(false)
    }, [mediaId, mediaType, user?.id])

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

    async function toggleReaction(reviewId: string, reactionType: ReactionType) {
        if (!user || pendingReactionReviewIds.includes(reviewId)) return

        setPendingReactionReviewIds((currentIds) => [...currentIds, reviewId])
        setError("")

        const currentReaction = reactionsByReviewId[reviewId]?.userReaction ?? null

        if (currentReaction === reactionType) {
            const { error: deleteError } = await supabase
                .from("review_reactions")
                .delete()
                .eq("review_id", reviewId)
                .eq("user_id", user.id)

            if (deleteError) {
                setError(deleteError.message)
            }
        } else if (currentReaction) {
            const { error: updateError } = await supabase
                .from("review_reactions")
                .update({ reaction_type: reactionType })
                .eq("review_id", reviewId)
                .eq("user_id", user.id)

            if (updateError) {
                setError(updateError.message)
            }
        } else {
            const { error: insertError } = await supabase
                .from("review_reactions")
                .insert({
                    review_id: reviewId,
                    user_id: user.id,
                    reaction_type: reactionType,
                })

            if (insertError) {
                setError(insertError.message)
            }
        }

        await loadReviews()
        setPendingReactionReviewIds((currentIds) => currentIds.filter((currentId) => currentId !== reviewId))
    }

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
                    {reviews.map((review) => {
                        const reactionSummary = reactionsByReviewId[review.id] ?? {
                            likes: 0,
                            dislikes: 0,
                            userReaction: null,
                        }
                        const reactionIsPending = pendingReactionReviewIds.includes(review.id)

                        return (
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

                                <div className="mt-4 flex items-center gap-2 border-t border-[#2d3f55]/50 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleReaction(review.id, "like")}
                                        disabled={!user || reactionIsPending}
                                        aria-pressed={reactionSummary.userReaction === "like"}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                                            reactionSummary.userReaction === "like"
                                                ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
                                                : "border-[#2d3f55] bg-[#111827] text-slate-400 hover:border-emerald-400/60 hover:text-emerald-300"
                                        }`}
                                    >
                                        Like {reactionSummary.likes}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleReaction(review.id, "dislike")}
                                        disabled={!user || reactionIsPending}
                                        aria-pressed={reactionSummary.userReaction === "dislike"}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                                            reactionSummary.userReaction === "dislike"
                                                ? "border-[#d11c7f] bg-[#d11c7f]/15 text-[#f2a4cf]"
                                                : "border-[#2d3f55] bg-[#111827] text-slate-400 hover:border-[#d11c7f]/60 hover:text-[#f2a4cf]"
                                        }`}
                                    >
                                        Dislike {reactionSummary.dislikes}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </section>
    )
}