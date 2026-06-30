import { TMDB_API_BASE_URL, TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";
import Link from "next/link";
import MediaReviewForm from "@/components/MediaReviewForm"
import MediaReviewsList from "@/components/MediaReviewsList";
import SavedItemButtons from "@/components/SavedItemButtons";

export default async function SeriesInfo({ params, searchParams }: any) {
    const params2 = await params
    const seriesId = params2.id
    const searchPar = await searchParams
    const returnPage = searchPar.from || 1
    const searchQuery = searchPar.query || ''
    const genre = searchPar.genre || ''
    const sort = searchPar.sort || ''
    const returnTo = searchPar.returnTo === '/favourites' || searchPar.returnTo === '/watchlist' || searchPar.returnTo === '/profile'
        ? searchPar.returnTo
        : ''

    const res = await fetch(
        `${TMDB_API_BASE_URL}/tv/${seriesId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits,release_dates`
    )
    const show = await res.json()

    const topCast = show.credits?.cast?.slice(0, 5) || []
    const creators = show.created_by || []
    const reviewItem = {
        id: show.id,
        name: show.name,
        poster_path: show.poster_path,
        vote_average: show.vote_average,
        first_air_date: show.first_air_date,
    }

    return (
        <>
            <main className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
                {show.backdrop_path && (
                    <div className="absolute top-0 left-0 w-full h-[45vh] overflow-hidden -z-10">
                        <img 
                            src={`${TMDB_IMAGE_BASE_URL}/original${show.backdrop_path}`} 
                            alt="" 
                            className="w-full h-full object-cover opacity-50 blur-sm"
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0f172a]/40 to-[#0f172a]"></div>
                    </div>
                )}

                <Link
                    href={returnTo || `/tv?page=${returnPage}${searchQuery ? `&query=${searchQuery}` : ''}${genre ? `&genre=${genre}` : ''}${sort ? `&sort=${sort}` : ''}`}
                    className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors mb-10 text-sm font-medium"
                >
                    ← Go back
                </Link>

                <div className="flex flex-col md:flex-row gap-10">
                    <div className="shrink-0 mx-auto md:mx-0">
                        <img
                            src={show.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${show.poster_path}` : "https://placehold.co/500x750/1e293b/94a3b8?text=No+Poster"}
                            alt={show.name}
                            className="w-52 md:w-64 rounded-2xl shadow-lg"
                        />
                    </div>

                    <div className="flex flex-col gap-5 min-w-0">
                        <div>
                            <h1 className="text-3xl font-bold mb-1 text-slate-100">{show.name}</h1>
                            <p className="text-slate-400 italic text-sm">{show.tagline}</p>
                        </div>

                        <SavedItemButtons show={reviewItem} type="tv" variant="detail" />

                        <div className="flex flex-wrap gap-2">
                            {show.genres?.map((g: any) => (
                                <span key={g.id} className="text-xs bg-indigo-400/20 text-indigo-400 px-3 py-1 rounded-full font-medium">
                                    {g.name}
                                </span>
                            ))}
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Summary</p>
                            <p className="text-slate-300 leading-relaxed text-sm">{show.overview}</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-[#1e293b] rounded-xl p-3 border border-[#2d3f55]">
                                <p className="text-xs text-slate-400 mb-1">Rating</p>
                                <p className="text-indigo-400 font-bold">★ {show.vote_average?.toFixed(1) || "N/A"}</p>
                            </div>
                            
                            <div className="bg-[#1e293b] rounded-xl p-3 border border-[#2d3f55]">
                                <p className="text-xs text-slate-400 mb-1">Seasons</p>
                                <p className="font-medium text-sm text-slate-100">
                                    {show.number_of_seasons} {show.number_of_seasons === 1 ? "Season" : "Seasons"}
                                </p>
                            </div>
                            
                            <div className="bg-[#1e293b] rounded-xl p-3 border border-[#2d3f55]">
                                <p className="text-xs text-slate-400 mb-1">First Air Date</p>
                                <p className="font-medium text-sm text-slate-100">{show.first_air_date || "Unknown"}</p>
                            </div>
                            
                            <div className="bg-[#1e293b] rounded-xl p-3 border border-[#2d3f55]">
                                <p className="text-xs text-slate-400 mb-1">Episodes</p>
                                <p className="font-medium text-sm text-slate-100">
                                    {show.number_of_episodes} {show.number_of_episodes === 1 ? "Episode" : "Episodes"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[#2d3f55]/40 pt-4">
                            {creators.length > 0 && (
                                <p className="text-sm text-slate-400">
                                    Creators:{" "}
                                    {creators.map((c: any, idx: number) => (
                                        <span key={c.id} className="text-slate-200 font-semibold">
                                            {c.name}{idx < creators.length - 1 ? ", " : ""}
                                        </span>
                                    ))}
                                </p>
                            )}
                            
                            {topCast.length > 0 && (
                                <p className="text-sm text-slate-400">
                                    Featuring:{" "}
                                    {topCast.map((actor: any, idx: number) => (
                                        <span key={actor.id} className="text-slate-200 font-medium">
                                            {actor.name}{idx < topCast.length - 1 ? ", " : ""}
                                        </span>
                                    ))}
                                </p>
                            )}

                            <p className="text-sm text-slate-400">
                                Original language: <span className="text-slate-100 font-medium uppercase">{show.original_language}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <MediaReviewForm
                    mediaId={show.id}
                    mediaType="tv"
                    item={reviewItem}
                />

                <MediaReviewsList
                    mediaId={show.id}
                    mediaType="tv"
                />
            </main>
        </>
    )
}