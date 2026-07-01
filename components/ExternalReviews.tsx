"use client"

import { useEffect, useMemo, useState } from "react"

type MediaType = "movie" | "tv"
type SortMode = "newest" | "highest" | "lowest"
type RatingFilter = "all" | "5" | "6" | "7" | "8" | "9" | "unrated"

const sortOptions: { value: SortMode; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "highest", label: "Top rated" },
    { value: "lowest", label: "Lowest rated" },
]

const ratingOptions: { value: RatingFilter; label: string }[] = [
    { value: "all", label: "Any rating" },
    { value: "5", label: "5+ rated" },
    { value: "6", label: "6+ rated" },
    { value: "7", label: "7+ rated" },
    { value: "8", label: "8+ rated" },
    { value: "9", label: "9+ rated" },
    { value: "unrated", label: "Unrated only" },
]

interface ExternalReviewsProps {
    mediaId: number;
    mediaType: MediaType;
}

interface TmdbAuthorDetails {
    rating?: number | null;
}

interface TmdbReview {
    id: string;
    author: string;
    author_details?: TmdbAuthorDetails;
    content: string;
    created_at: string;
    updated_at: string;
    url: string;
}

interface TmdbReviewsResponse {
    page: number;
    results: TmdbReview[];
    total_pages: number;
    total_results: number;
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date))
}

function getRating(review: TmdbReview) {
    const rating = review.author_details?.rating
    return typeof rating === "number" ? rating : null
}

function truncateReview(content: string, limit = 220) {
    if (content.length <= limit) return content
    return `${content.slice(0, limit).trim()}...`
}

function isTmdbReviewsResponse(data: TmdbReviewsResponse | { error?: string } | null): data is TmdbReviewsResponse {
    return !!data && "results" in data
}

export default function ExternalReviews({ mediaId, mediaType }: ExternalReviewsProps) {
    const [reviews, setReviews] = useState<TmdbReview[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalResults, setTotalResults] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [sortMode, setSortMode] = useState<SortMode>("newest")
    const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
    const [error, setError] = useState("")

    async function loadReviews(page: number, mode: "replace" | "append") {
        if (mode === "replace") {
            setIsLoading(true)
        } else {
            setIsLoadingMore(true)
        }
        setError("")

        const params = new URLSearchParams({
            mediaId: String(mediaId),
            mediaType,
            page: String(page),
        })
        const response = await fetch(`/api/tmdb-reviews?${params.toString()}`)
        const data = await response.json().catch(() => null) as TmdbReviewsResponse | { error?: string } | null

        if (!response.ok || !isTmdbReviewsResponse(data)) {
            const errorMessage = data && "error" in data && typeof data.error === "string"
                ? data.error
                : "Could not load external reviews."

            setError(errorMessage)
            setIsLoading(false)
            setIsLoadingMore(false)
            return
        }

        setReviews((currentReviews) => mode === "append"
            ? [...currentReviews, ...data.results]
            : data.results
        )
        setCurrentPage(data.page)
        setTotalPages(data.total_pages)
        setTotalResults(data.total_results)
        setIsLoading(false)
        setIsLoadingMore(false)
    }

    useEffect(() => {
        setReviews([])
        setCurrentPage(0)
        setTotalPages(0)
        setTotalResults(0)
        setSortMode("newest")
        setRatingFilter("all")
        loadReviews(1, "replace")
    }, [mediaId, mediaType])

    const visibleReviews = useMemo(() => {
        const filteredReviews = reviews.filter((review) => {
            const rating = getRating(review)

            if (ratingFilter === "all") return true
            if (ratingFilter === "unrated") return rating === null
            if (rating === null) return false

            return rating >= Number(ratingFilter)
        })

        return [...filteredReviews].sort((firstReview, secondReview) => {
            if (sortMode === "highest") {
                return (getRating(secondReview) ?? -1) - (getRating(firstReview) ?? -1)
            }

            if (sortMode === "lowest") {
                return (getRating(firstReview) ?? 11) - (getRating(secondReview) ?? 11)
            }

            return new Date(secondReview.updated_at).getTime() - new Date(firstReview.updated_at).getTime()
        })
    }, [ratingFilter, reviews, sortMode])

    const previewReviews = reviews.slice(0, 2)
    const canLoadMore = currentPage < totalPages

    if (isLoading) {
        return (
            <section className="mt-5 rounded-xl border border-[#2d3f55] bg-[#1e293b] p-5 sm:p-6">
                <p className="text-sm text-slate-400">Loading external reviews...</p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="mt-5 rounded-xl border border-[#2d3f55] bg-[#1e293b] p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-100">External reviews</h2>
                <p className="mt-3 text-sm text-red-400">{error}</p>
            </section>
        )
    }

    if (reviews.length === 0) {
        return (
            <section className="mt-5 rounded-xl border border-[#2d3f55] bg-[#1e293b] p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-100">External reviews</h2>
                <p className="mt-3 text-sm text-slate-500">No TMDB reviews available yet.</p>
            </section>
        )
    }

    return (
        <>
            <section className="mt-5 rounded-xl border border-[#2d3f55] bg-[#1e293b] p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">External reviews</h2>
                        <p className="mt-1 text-sm text-slate-400">Reviews from TMDB users.</p>
                    </div>
                    <span className="text-xs font-bold text-[#f2a4cf]">{totalResults}</span>
                </div>

                <div className="mt-5 grid gap-3">
                    {previewReviews.map((review) => {
                        const rating = getRating(review)

                        return (
                            <article key={review.id} className="rounded-xl border border-[#3a3555] bg-[#11162a] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-slate-100">{review.author || "TMDB user"}</p>
                                        <p className="mt-0.5 text-xs font-bold text-[#f2a4cf]">
                                            {rating === null ? "No rating" : `${rating}/10`}
                                        </p>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{formatDate(review.updated_at)}</p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-300">{truncateReview(review.content)}</p>
                            </article>
                        )
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 rounded-xl bg-[#d11c7f]/20 px-4 py-2.5 text-sm font-bold text-[#f7c6df] transition-colors hover:bg-[#d11c7f]/30 cursor-pointer"
                >
                    View all reviews
                </button>
            </section>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-70 grid place-items-center bg-[#020617]/75 px-4 py-6 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="external-reviews-title"
                        className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#f2a4cf]/20 bg-[#151223] shadow-2xl shadow-black/40 animate-[profileModalIn_220ms_ease-out]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="border-b border-[#3a3555] bg-[#1b172c] p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 id="external-reviews-title" className="text-lg font-bold text-slate-100">External reviews</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Loaded {reviews.length} of {totalResults} TMDB reviews.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-[#2a2138] hover:text-slate-100 cursor-pointer"
                                    aria-label="Close external reviews"
                                >
                                    x
                                </button>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_14rem] md:items-end">
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Sort
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setSortMode(option.value)}
                                                aria-pressed={sortMode === option.value}
                                                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                                                    sortMode === option.value
                                                        ? "border-[#f2a4cf] bg-[#d11c7f]/25 text-[#f7c6df]"
                                                        : "border-[#453457] bg-[#100d1d] text-slate-400 hover:border-[#f2a4cf]/60 hover:text-slate-100"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="external-review-rating" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Minimum rating
                                    </label>
                                    <select
                                        id="external-review-rating"
                                        value={ratingFilter}
                                        onChange={(event) => setRatingFilter(event.target.value as RatingFilter)}
                                        className="w-full rounded-full border border-[#453457] bg-[#100d1d] px-3 py-1.5 text-xs font-bold text-slate-200 outline-none transition-colors focus:border-[#f2a4cf] cursor-pointer"
                                    >
                                        {ratingOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-[#151223] p-4 sm:p-5">
                            {visibleReviews.length === 0 ? (
                                <p className="text-sm text-slate-500">No loaded reviews match this filter.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {visibleReviews.map((review) => {
                                        const rating = getRating(review)

                                        return (
                                            <article key={review.id} className="rounded-xl border border-[#3a3555] bg-[#100d1d] p-4">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-100">{review.author || "TMDB user"}</p>
                                                        <p className="mt-0.5 text-xs font-bold text-[#f2a4cf]">
                                                            {rating === null ? "No rating" : `${rating}/10`}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500">{formatDate(review.updated_at)}</p>
                                                </div>
                                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{review.content}</p>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[#3a3555] bg-[#1b172c] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <p className="text-xs text-slate-500">
                                Page {currentPage} of {totalPages}
                            </p>
                            <button
                                type="button"
                                onClick={() => loadReviews(currentPage + 1, "append")}
                                disabled={!canLoadMore || isLoadingMore}
                                className="rounded-xl bg-[#d11c7f] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b01368] disabled:cursor-not-allowed disabled:bg-[#2a2138] disabled:text-slate-500 cursor-pointer"
                            >
                                {isLoadingMore ? "Loading..." : canLoadMore ? "Load more" : "All reviews loaded"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}