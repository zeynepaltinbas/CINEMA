import Pagination from "@/components/Pagination"
import SelectedFilters from "@/components/SelectedFilters"
import ShowBox from "@/components/ShowBox"
import type { MediaItem } from "@/types/media"

interface ContentGridProps {
    title: string;
    items: MediaItem[];
    totalPages: number;
    currentPage: number;
    searchQuery: string;
    currentSort: string;
    currentGenre: string;
    currentTab?: string;
    type: "movies" | "tv";
}

export default function ContentGrid({ title, items, totalPages, currentPage, searchQuery, currentSort, currentGenre, currentTab = "popular", type = "movies" }: ContentGridProps) {
    return (
        <main className="min-h-screen px-4 max-w-7xl mx-auto">
            <div className="mb-6">
                {searchQuery ? (
                    <h2 className="text-lg text-slate-400 mb-1 mt-5">
                        Results for "{searchQuery}"
                    </h2>
                ) : (
                    <h1 className="text-2xl font-bold text-slate-100 mt-5">
                        {title}
                    </h1>
                )}
                <SelectedFilters
                    searchQuery={searchQuery}
                    currentSort={currentSort}
                    currentGenre={currentGenre}
                    currentTab={currentTab}
                    type={type}
                />
            </div>

            {items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((i) => (
                        <ShowBox
                            key={i.id}
                            show={i}
                            currentPage={currentPage}
                            searchQuery={searchQuery}
                            currentSort={currentSort}
                            currentGenre={currentGenre}
                            type={type}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center py-20 text-lg">No show found.</p>
            )}

            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                searchQuery={searchQuery}
                itemsLength={items.length}
                currentGenre={currentGenre}
                currentSort={currentSort}
                currentTab={currentTab}
                type={type}
            />
        </main>
    )
}