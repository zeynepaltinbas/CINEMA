// Next.js will pass params.id into this file
import Link from "next/link"

export default async function MovieInfo({ params, searchParams }: any) {
    const params2 = await params
    const movieId = params2.id
    const searchPar = await searchParams
    const returnPage = searchPar.from || 1
    const searchQuery = searchPar.query || ''

    const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`
    )
    const movie = await res.json()

    return(
        <main>
            <div>
                <h1>{movie.title}</h1>
                <p>{movie.tagline}</p>
                <p>Summary: {movie.overview}</p>
                <p>Rating: {movie.vote_average}</p>
                <p>Genres: {movie.genres.map((g: any) => (
                    <span key={g.id}>
                        {g.name}
                    </span>
                ))}</p>
                <p>Status: {movie.status}</p>
                <p>Original Language: {movie.original_language}</p>
                <p>Release Date: {movie.release_date}</p>
                <p>Duration: {movie.runtime} min</p>
            </div>
            <Link href={`/?page=${returnPage}${searchQuery ? `&query=${searchQuery}` : ''}`}>Go Back</Link>
        </main>
    )
}