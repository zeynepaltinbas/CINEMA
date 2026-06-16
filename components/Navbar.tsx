"use client" // to track url
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname() // returns "/movies" or "/tv"
    return (
        <header className="border-b border-[#2d3f55] bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-wider text-slate-100 hover:text-indigo-400 transition-colors uppercase">
                    CINEMA
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/movies" 
                        className={`text-sm font-medium transition-colors cursor-pointer ${
                            pathname.startsWith("/movies") ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                        }`}>
                        Movies
                    </Link>
                    <Link href="/tv" 
                        className={`text-sm font-medium transition-colors cursor-pointer ${
                            pathname.startsWith("/tv") ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                        }`}>
                        TV Series
                    </Link>
                </div>

                <Link href="/" className="bg-[#1e293b] border border-[#2d3f55] hover:bg-[#2d3f55] text-slate-100 font-medium px-4 py-1.5 rounded-lg text-sm transition-colors">
                    Sign in
                </Link>
            </div>
        </header>
    )
}