import Link from "next/link"

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    searchQuery: string;
    itemsLength: number;
    currentSort: string;
    currentGenre: string;
    currentTab?: string;
    type?: "movies" | "tv";
}

export default function Pagination({ currentPage, totalPages, searchQuery, itemsLength, currentGenre, currentSort, currentTab = "popular", type = "movies" }: PaginationProps) {
    // builds the url for a given page number, carrying over all active filters
    const queryString = (page: number) =>
        `/${type}?page=${page}${searchQuery ? `&query=${searchQuery}` : ''}${currentSort ? `&sort=${currentSort}` : ''}${currentGenre ? `&genre=${currentGenre}` : ''}${currentTab !== "popular" ? `&tab=${currentTab}` : ''}`

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* pagination */}
            <div className="flex items-center justify-center gap-4 mt-12">
                {currentPage > 1 ? (
                    <Link href={queryString(currentPage - 1)}>
                        <button className="px-4 py-2 bg-[#1e293b] border border-[#2d3f55] hover:bg-[#2d3f55] rounded-lg transition-colors cursor-pointer text-sm text-slate-100">
                            Previous
                        </button>
                    </Link>
                ) : (
                    <button disabled className="px-4 py-2 bg-[#1e293b] border border-[#2d3f55] text-slate-600 rounded-lg cursor-not-allowed text-sm">
                        Previous
                    </button>
                )}
                <span className="text-slate-400 text-sm">
                    Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages ? (
                    <Link href={queryString(currentPage + 1)}>
                        <button className="px-4 py-2 bg-[#1e293b] border border-[#2d3f55] hover:bg-[#2d3f55] rounded-lg transition-colors cursor-pointer text-sm text-slate-100">
                            Next
                        </button>
                    </Link>
                ) : (
                    <button disabled className="px-4 py-2 bg-[#1e293b] border border-[#2d3f55] text-slate-600 rounded-lg cursor-not-allowed text-sm">
                        Next
                    </button>
                )}
            </div>

            {/* go to page... */}
            {itemsLength > 0 && (
                <form action={`/${type}`} method="GET" className="flex items-center justify-center gap-2 mt-4 text-slate-400 text-sm">
                    {searchQuery && <input type="hidden" name="query" value={searchQuery} />}
                    {currentSort && <input type="hidden" name="sort" value={currentSort} />}
                    {currentGenre && <input type="hidden" name="genre" value={currentGenre} />}
                    {currentTab !== "popular" && <input type="hidden" name="tab" value={currentTab} />}
                    <label htmlFor="jump-page">Go to page: </label>
                    <input type="number" id="jump-page" name="page" min="1"
                        max={totalPages}
                        placeholder={currentPage.toString()}
                        className="w-16 text-center bg-[#1e293b] border border-[#2d3f55] rounded-lg p-1 text-slate-100 focus:outline-none focus:border-indigo-400"
                    />
                </form>
            )}
        </div>
    )
}