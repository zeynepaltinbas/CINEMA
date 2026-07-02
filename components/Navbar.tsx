"use client"
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SortMenu from "./SortMenu";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { useAuth } from "./AuthProvider";
import { useNotification } from "./NotificationProvider";
import type { User } from "@supabase/supabase-js";

interface AccountActionsProps {
    isSignedIn: boolean;
    isLoading: boolean;
    user: User | null;
    pathname: string;
    mobile?: boolean;
    onSignIn: () => void;
    onSignOut: () => Promise<void>;
    onNavigate?: () => void;
}

function getUserDisplayName(user: User | null) {
    if (!user) return ""

    return user.user_metadata.full_name
        || `${user.user_metadata.name || ""} ${user.user_metadata.surname || ""}`.trim()
        || `${user.user_metadata.first_name || ""} ${user.user_metadata.last_name || ""}`.trim()
        || user.email?.split("@")[0]
        || "Profile"
}

function ProfileAvatar({ user, mobile = false }: { user: User; mobile?: boolean }) {
    const displayName = getUserDisplayName(user)
    const avatarUrl = typeof user.user_metadata.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : ""
    const initial = displayName.charAt(0).toUpperCase()

    return (
        <span className={mobile ? "flex items-center gap-3" : "block"}>
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt=""
                    className={`${mobile ? "w-9 h-9" : "w-8 h-8"} rounded-full object-cover border border-[#2d3f55]`}
                />
            ) : (
                <span className={`${mobile ? "w-9 h-9" : "w-8 h-8"} rounded-full bg-[#d11c7f] text-white grid place-items-center text-xs font-bold border border-[#2d3f55]`}>
                    {initial}
                </span>
            )}
            {mobile && <span>Profile</span>}
        </span>
    )
}

function AccountActions({ isSignedIn, isLoading, user, pathname, mobile = false, onSignIn, onSignOut, onNavigate }: AccountActionsProps) {
    const isFavouritesPage = pathname.startsWith("/favourites")
    const isWatchlistPage = pathname.startsWith("/watchlist")
    const isProfilePage = pathname.startsWith("/profile")

    const containerClass = mobile
        ? "mt-auto flex flex-col gap-3"
        : "hidden md:flex items-center gap-2 shrink-0"

    const linkClass = (isActive: boolean) => mobile
        ? `text-sm font-semibold transition-colors ${isActive ? "text-indigo-400" : "text-slate-300 hover:text-indigo-400"}`
        : `text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "text-indigo-400" : "text-slate-300 hover:text-indigo-400"}`

    const favouritesIconClass = mobile
        ? `flex items-center gap-3 text-sm font-semibold transition-colors ${isFavouritesPage ? "text-[#d11c7f]" : "text-slate-300 hover:text-[#d11c7f]"}`
        : `w-8 h-8 grid place-items-center text-xl leading-none rounded-lg transition-colors ${isFavouritesPage ? "text-[#d11c7f] bg-[#1e293b]" : "text-slate-300 hover:text-[#d11c7f] hover:bg-[#1e293b]"}`

    const watchlistIconClass = mobile
        ? `flex items-center gap-3 text-sm font-semibold transition-colors ${isWatchlistPage ? "text-indigo-400" : "text-slate-300 hover:text-indigo-400"}`
        : `w-8 h-8 grid place-items-center text-xl leading-none rounded-lg transition-colors ${isWatchlistPage ? "text-indigo-400 bg-[#1e293b]" : "text-slate-300 hover:text-indigo-400 hover:bg-[#1e293b]"}`

    const buttonClass = mobile
        ? "w-full flex items-center justify-center gap-2 bg-[#1e293b] border border-[#2d3f55] text-slate-100 font-medium py-2 rounded-lg text-xs cursor-pointer hover:bg-[#2d3f55] transition-colors"
        : "flex items-center gap-2 bg-[#1e293b] border border-[#2d3f55] hover:bg-[#2d3f55] text-slate-100 font-medium px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"

    if (isLoading) {
        return <div className={containerClass} />
    }

    return (
        <div className={containerClass}>
            {isSignedIn ? (
                <>
                    <Link href="/favourites" onClick={onNavigate} className={favouritesIconClass} aria-label="Favourites">
                        <span className="text-2xl leading-none">❦</span>
                        {mobile && <span>Favourites</span>}
                    </Link>
                    <Link href="/watchlist" onClick={onNavigate} className={watchlistIconClass} aria-label="Watchlist">
                        <span className="text-xl leading-none">▣</span>
                        {mobile && <span>Watchlist</span>}
                    </Link>
                    {user && (
                        <Link
                            href="/profile"
                            onClick={onNavigate}
                            className={mobile ? linkClass(isProfilePage) : `rounded-full transition-all ${isProfilePage ? "ring-2 ring-indigo-400/70" : "hover:ring-2 hover:ring-indigo-400/60"}`}
                            aria-label="Profile"
                        >
                            <ProfileAvatar user={user} mobile={mobile} />
                        </Link>
                    )}
                    <button type="button" onClick={onSignOut} className={buttonClass}>
                        Sign Out
                    </button>
                </>
            ) : (
                <button type="button" onClick={onSignIn} className={buttonClass}>
                    <img src="/login.png" alt="" className="w-4 h-4 invert opacity-80" />
                    Sign In
                </button>
            )}
        </div>
    )
}

export default function Navbar() {
    const pathname = usePathname() // returns "/movies", "/tv" or "/"
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isAuthLoading, signOut } = useAuth()
    const { showNotification } = useNotification()

    const searchQuery = searchParams.get("query") || ""
    const currentSort = searchParams.get("sort") || "popularity.desc"
    const currentGenre = searchParams.get("genre") || ""

    const isSortAvailable = !searchQuery
    const [isOpen, setIsOpen] = useState(false)
    const desktopFilterRef = useRef<HTMLDivElement>(null)
    const mobileFilterRef = useRef<HTMLDivElement>(null)

    const isMoviePage = pathname.startsWith("/movies")
    const isTvPage = pathname.startsWith("/tv")
    const isSearchAvailable = isMoviePage || isTvPage
    
    const placeholder = isTvPage ? "Search for a TV Show..." : "Search for a Movie..."

    const [isAuthOpen, setIsAuthOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSignUpOpen, setIsSignUpOpen] = useState(false)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        const savedNotification = sessionStorage.getItem("auth_notification")

        if (savedNotification) {
            showNotification(savedNotification)
            sessionStorage.removeItem("auth_notification")
        }
    }, [showNotification])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node
            const clickedInsideDesktop = desktopFilterRef.current?.contains(target)
            const clickedInsideMobile = mobileFilterRef.current?.contains(target)

            if (!clickedInsideDesktop && !clickedInsideMobile) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    function handleSignUpSuccess() {
        setIsSignUpOpen(false)
        showNotification(
            "Account created successfully. Check your email for confirmation.",
            { label: "Log in?", onClick: () => setIsAuthOpen(true) }
        )
    }

    function handleSignInSuccess(name: string) {
        setIsAuthOpen(false)
        setIsSignUpOpen(false)
        showNotification(`Login successful. Welcome, ${name}!`)

        if (pathname !== "/movies") {
            sessionStorage.setItem("auth_notification", `Login successful. Welcome, ${name}!`)
        }

        router.push("/movies")
        router.refresh()
    }

    async function handleSignOut() {
        try {
            await signOut()
            setIsMobileMenuOpen(false)
            showNotification("Signed out successfully.")
            router.push("/movies")
            router.refresh()
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Could not sign out. Please try again.")
        }
    }

    function clearSearch() {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("query")

        const queryString = params.toString()
        router.push(queryString ? `${pathname}?${queryString}` : pathname)
        setIsMobileMenuOpen(false)
    }

    return (
        <>
            <header className="border-b border-[#2d3f55] bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
                    <Link href="/" className="text-base sm:text-xl font-bold tracking-wider text-slate-100 hover:text-indigo-400 transition-colors uppercase shrink-0">
                        CINEMA
                    </Link>

                    {/* pc links */}
                    <div className="hidden md:flex items-center gap-3 sm:gap-6 shrink-0">
                        <Link href="/movies" 
                            className={`text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                isMoviePage ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                            }`}>
                            Movies
                        </Link>
                        <Link href="/tv" 
                            className={`text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                isTvPage ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                            }`}>
                            TV Series
                        </Link>
                    </div>

                    {isSearchAvailable && (
                        <div ref={desktopFilterRef} className="hidden md:block flex-1 max-w-md relative mx-2 sm:mx-4">
                            <div className="flex gap-2 w-full">
                                <form action={pathname} method="GET" className="flex gap-2 flex-1">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            name="query"
                                            placeholder={placeholder}
                                            defaultValue={searchQuery}
                                            className="w-full bg-[#1e293b] border border-[#2d3f55] rounded-lg px-3 py-1.5 pr-8 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                aria-label="Clear search"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 text-sm font-bold cursor-pointer"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-indigo-400 text-[#0f172a] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-300 transition-colors cursor-pointer"
                                    >
                                        Search
                                    </button>
                                </form>

                                <button
                                    onClick={() => isSortAvailable && setIsOpen(!isOpen)}
                                    className={`flex items-center justify-center px-2.5 border rounded-lg transition-all text-xs font-semibold select-none ${
                                        isSortAvailable 
                                            ? "bg-[#1e293b] border-[#2d3f55] text-indigo-400 hover:border-indigo-400/60 cursor-pointer pointer-events-auto" 
                                            : "bg-[#1e293b]/40 border-[#2d3f55]/30 text-slate-600 pointer-events-none"
                                    }`}
                                >
                                    Filter
                                </button>
                            </div>

                            <div className={`absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-[#2d3f55] rounded-xl shadow-2xl p-3.5 grid transition-[grid-template-rows,opacity] duration-300 ease-in-out z-50 ${
                                isOpen && isSortAvailable ? "grid-rows-[1fr] opacity-100 visible overflow-visible" : "grid-rows-[0fr] opacity-0 invisible overflow-hidden"
                            }`}>
                                <div className="min-h-0 overflow-visible">
                                    <div className="w-full flex justify-center overflow-visible">
                                        <SortMenu
                                            currentFilters={currentSort}
                                            currentGenre={currentGenre}
                                            type={isTvPage ? "tv" : "movies"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <AccountActions
                        isSignedIn={isClient && Boolean(user)}
                        isLoading={!isClient || isAuthLoading}
                        user={user}
                        pathname={pathname}
                        onSignIn={() => setIsAuthOpen(true)}
                        onSignOut={handleSignOut}
                    />

                    {/* menu for mobile */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="block md:hidden bg-[#1e293b] border border-[#2d3f55] text-slate-300 hover:text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                    >
                        <img src="/nav.png" alt="Menu" className="w-5 h-5 invert opacity-90" />
                    </button>
                </div>
            </header>

            {/* mobile panel */}
            <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isMobileMenuOpen ? "visible" : "invisible pointer-events-none"}`}>
                <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMobileMenuOpen(false)} />
                
                <div className={`absolute right-0 top-0 bottom-0 w-72 bg-[#0f172a] border-l border-[#2d3f55] p-6 flex flex-col gap-6 transition-transform duration-300 transform ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                    
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="self-end text-sm font-bold text-slate-400 hover:text-slate-200 cursor-pointer select-none"
                    >
                        ✕
                    </button>

                    <div className="flex flex-col gap-4">
                        <Link href="/movies" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-semibold cursor-pointer ${isMoviePage ? "text-indigo-400" : "text-slate-300"}`}>
                            Movies
                        </Link>
                        <Link href="/tv" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-semibold cursor-pointer ${isTvPage ? "text-indigo-400" : "text-slate-300"}`}>
                            TV Series
                        </Link>
                    </div>

                    <hr className="border-[#2d3f55]" />

                    {isSearchAvailable && (
                        <div ref={mobileFilterRef} className="flex flex-col gap-3 relative">
                            <form action={pathname} method="GET" onSubmit={() => setIsMobileMenuOpen(false)} className="flex flex-col gap-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="query"
                                        placeholder={placeholder}
                                        defaultValue={searchQuery}
                                        className="w-full bg-[#1e293b] border border-[#2d3f55] rounded-lg px-3 py-1.5 pr-8 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            aria-label="Clear search"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 text-sm font-bold cursor-pointer"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex gap-2 w-full">
                                    <button type="submit" className="flex-1 bg-indigo-400 text-[#0f172a] text-xs font-semibold py-2 rounded-lg cursor-pointer">
                                        Search
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => isSortAvailable && setIsOpen(!isOpen)}
                                        className={`flex-1 flex items-center justify-center border rounded-lg text-xs font-semibold select-none py-2 cursor-pointer ${
                                            isSortAvailable ? "bg-[#1e293b] border-[#2d3f55] text-indigo-400" : "bg-[#1e293b]/40 border-[#2d3f55]/30 text-slate-600 pointer-events-none"
                                        }`}
                                    >
                                        Filter
                                    </button>
                                </div>
                            </form>

                            <div className={`absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-[#2d3f55] rounded-xl shadow-2xl p-3 grid transition-[grid-template-rows,opacity] duration-300 ease-in-out z-50 ${
                                isOpen && isSortAvailable ? "grid-rows-[1fr] opacity-100 visible overflow-visible" : "grid-rows-[0fr] opacity-0 invisible overflow-hidden"
                            }`}>
                                <div className="min-h-0 overflow-visible">
                                    <div className="w-full flex justify-center scale-95 origin-top overflow-visible [&>div]:flex-col [&>div]:gap-3">
                                        <SortMenu
                                            currentFilters={currentSort}
                                            currentGenre={currentGenre}
                                            type={isTvPage ? "tv" : "movies"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* mobile account actions */}
                    <AccountActions
                        isSignedIn={isClient && Boolean(user)}
                        isLoading={!isClient || isAuthLoading}
                        user={user}
                        pathname={pathname}
                        mobile
                        onSignIn={() => { setIsMobileMenuOpen(false); setIsAuthOpen(true); }}
                        onSignOut={handleSignOut}
                        onNavigate={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            </div>

            <SignIn 
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSwitchToSignUp={() => setIsSignUpOpen(true)}
                onSuccess={handleSignInSuccess}
            />

            <SignUp 
                isOpen={isSignUpOpen}
                onClose={() => setIsSignUpOpen(false)}
                onSwitchToSignIn={() => setIsAuthOpen(true)}
                onSuccess={handleSignUpSuccess}
            />
        </>
    )
}