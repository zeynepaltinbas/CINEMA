import Link from "next/link";

export default function Navbar() {
    return (
        <header className="border-b border-[#2d3f55] bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-wider text-slate-100 hover:text-indigo-400 transition-colors uppercase">
                    CINEMA
                </Link>
                <div className="flex items-center gap-6">
                    <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                        Movies
                    </button>
                    <button className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                        TV Series
                    </button>
                </div>

                <Link href="/" className="bg-[#1e293b] border border-[#2d3f55] hover:bg-[#2d3f55] text-slate-100 font-medium px-4 py-1.5 rounded-lg text-sm transition-colors">
                    Sign in
                </Link>
            </div>
        </header>
    )
}