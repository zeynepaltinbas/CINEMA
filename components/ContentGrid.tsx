import Pagination from "@/components/Pagination"
import SortMenu from "@/components/SortMenu"
import ShowBox from "@/components/ShowBox"
import Link from "next/link"
// @ means root directory --> also declared in tsconfig.json

interface ContentGridProps {
    title: string; // popular movies / tvseries
    placeholder: string; // search for movies / tv series
    formAction: string; // "/movies" or "/tv"
    items: any[];
    totalPages: number;
    currentPage: number;
    searchQuery: string;
    currentSort: string;
    currentGenre: string;
    currentTab?: string;
    type: "movies" | "tv";
}

export default function ContentGrid({ title, placeholder, formAction, items, totalPages, currentPage, searchQuery, currentSort, currentGenre, currentTab = "popular", type = "movies" }: ContentGridProps) {
    return (
        <main className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
            <div className="max-w-xl mx-auto mb-3 flex flex-col items-center">
                <form action={formAction} method="GET" className="flex gap-2 mb-5 w-full">
                    <input
                        type="text"
                        name="query"
                        placeholder={placeholder}
                        defaultValue={searchQuery}
                        className="flex-1 bg-[#1e293b] border border-[#2d3f55] rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                    {/* hidden field so tab survives a search submit */}
                    <input type="hidden" name="tab" value={currentTab} />
                    <button
                        type="submit"
                        className="bg-indigo-400 text-[#0f172a] font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-300 transition-colors cursor-pointer"
                    >
                        Search
                    </button>
                </form>
                {!searchQuery && currentTab === "popular" && (
                    <div className="w-full flex justify-center">
                        <SortMenu
                            currentFilters={currentSort}
                            currentGenre={currentGenre}
                            type={type}
                        />
                    </div>
                )}
            </div>
            
            {type === "movies" ? (
                <div className="mb-6">
                    {searchQuery && (
                        <h2 className="text-0.5xl text-slate-400 mb-1">
                            Results for "{searchQuery}"
                        </h2>
                    )}
                    <div className="flex items-center gap-4">
                        <Link
                            href={formAction}
                            className={`text-2xl font-bold transition-colors ${currentTab === "popular" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            {title}
                        </Link>
                        <Link
                            href={`${formAction}?tab=now_playing`}
                            className={`text-2xl font-bold transition-colors ${currentTab === "now_playing" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            Now Playing in TR
                        </Link>
                    </div>
                </div>
            ) : (
                <h2 className="text-0.5xl text-slate-400 mb-1">
                    Results for "{searchQuery}"
                </h2>
            )}

            {items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((i: any) => (
                        <ShowBox
                            key={i.id}
                            show = {i}
                            currentPage={currentPage}
                            searchQuery={searchQuery}
                            currentSort={currentSort}
                            currentGenre={currentGenre}
                            currentTab={currentTab}
                            type={type}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center py-20 text-lg">No show found.</p>
            )}

            <Pagination 
                currentPage = {currentPage}
                totalPages = {totalPages}
                searchQuery = {searchQuery}
                itemsLength = {items.length}
                currentGenre = {currentGenre}
                currentSort = {currentSort}
                currentTab = {currentTab}
                type = {type}
            />
        </main>
    )
}