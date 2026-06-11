import Link from "next/link"

// searchParams: query params
export default async function Home({ searchParams }: any) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const searchQuery = params.query || ""

    const endpoint = searchQuery 
        ? `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}&query=${searchQuery}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&page=${currentPage}`

    const res = await fetch(endpoint)
    const data = await res.json()
    // tmdb movie array: results
    const movies = data.results
    const totalPages = data.total_pages

    return(
        <main>
            <form action="/" method="GET">
                <input type="text" name="query" placeholder="Search for a movie..." defaultValue={searchQuery} />
                <button type="submit">Search</button>
            </form>

            <h1>{searchQuery ? `Search results for ${searchQuery}` : "Popular Movies"}</h1>

            {movies.map((m: any) => (
                <Link href={`/movies/${m.id}?from=${currentPage}${searchQuery ? `&query=${searchQuery}` : ''}`} key={m.id}>
                    <div>
                        {/* <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} /> */}
                        <h2>{m.title}</h2>
                        <p>Rating: {m.vote_average}</p>
                    </div>
                </Link>
            ))}

            {/* pagination */}
            <div>
                {currentPage > 1 ? (
                    <Link href={`/?page=${currentPage - 1}${searchQuery ? `&query=${searchQuery}` : ''}`}>
                        <button>prev</button>
                    </Link>
                ) : (
                    <button disabled>prev</button>
                )
                }
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages ? (
                    <Link href={`/?page=${currentPage + 1}${searchQuery ? `&query=${searchQuery}` : ''}`}>
                        <button>next</button>
                    </Link>
                ) : (
                    <button disabled>next</button>
                )
                }
            </div>
        </main>
    )
}