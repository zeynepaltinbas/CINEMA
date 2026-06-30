"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import { useNotification } from "@/components/NotificationProvider"
import { profileGenres } from "@/components/SortMenu"
import ProfileReviews from "@/components/ProfileReviews"
import ProfileWatched from "@/components/ProfileWatched"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import type { SubmitEvent } from "react"

interface ProfileForm {
    firstName: string;
    lastName: string;
    bday: string;
    favGenres: string[];
    avatarUrl: string;
    coverUrl: string;
    bio: string;
}

type ProfileTab = "reviews" | "watched" | "settings"

const emptyProfile: ProfileForm = {
    firstName: "",
    lastName: "",
    bday: "",
    favGenres: [],
    avatarUrl: "",
    coverUrl: "",
    bio: "",
}

function getMetadataValue(value: unknown) {
    return typeof value === "string" ? value : ""
}

function getGenreValues(value: unknown) {
    return Array.isArray(value)
        ? value.filter((genre): genre is string => typeof genre === "string")
        : []
}

function ProfileAvatar({ avatarUrl, initial, size = "large" }: { avatarUrl: string; initial: string; size?: "large" | "small" }) {
    const sizeClass = size === "large" ? "w-28 h-28 text-4xl sm:w-32 sm:h-32" : "w-14 h-14 text-xl"
    const borderClass = size === "large" ? "border-4 border-pink-300 shadow-2xl shadow-pink-500/20" : "border border-[#2d3f55]"

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt=""
                className={`${sizeClass} rounded-full object-cover ${borderClass}`}
            />
        )
    }

    return (
        <div className={`${sizeClass} rounded-full bg-[#d11c7f] text-white grid place-items-center font-bold ${borderClass}`}>
            {initial}
        </div>
    )
}

export default function ProfilePage() {
    const { user, isAuthLoading } = useAuth()
    const { showNotification } = useNotification()
    const [profile, setProfile] = useState<ProfileForm>(emptyProfile)
    const [savedProfile, setSavedProfile] = useState<ProfileForm>(emptyProfile)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
    const [isCoverMenuOpen, setIsCoverMenuOpen] = useState(false)
    const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false)
    const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState<ProfileTab>("reviews")
    const uploadInputRef = useRef<HTMLInputElement | null>(null)
    const cameraInputRef = useRef<HTMLInputElement | null>(null)
    const coverInputRef = useRef<HTMLInputElement | null>(null)

    const fullName = useMemo(() => {
        const name = `${profile.firstName} ${profile.lastName}`.trim()
        return name || user?.email?.split("@")[0] || "Your profile"
    }, [profile.firstName, profile.lastName, user?.email])

    const avatarInitial = fullName.charAt(0).toUpperCase()

    useEffect(() => {
        let isMounted = true

        async function loadProfile() {
            if (!user) {
                setProfile(emptyProfile)
                setSavedProfile(emptyProfile)
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError("")

            const { data, error: profileError } = await supabase
                .from("profiles")
                .select("first_name, last_name, bday, fav_genres, avatar_url, bio")
                .eq("id", user.id)
                .maybeSingle()

            if (!isMounted) return

            if (profileError) {
                setError(profileError.message)
                setIsLoading(false)
                return
            }

            const metadata = user.user_metadata
            const fullNameFromMetadata = getMetadataValue(metadata.full_name)
            const [firstNameFromFullName = "", ...lastNameParts] = fullNameFromMetadata.split(" ")
            const loadedProfile = {
                firstName: data?.first_name
                    || getMetadataValue(metadata.first_name)
                    || getMetadataValue(metadata.name)
                    || firstNameFromFullName,
                lastName: data?.last_name
                    || getMetadataValue(metadata.last_name)
                    || getMetadataValue(metadata.surname)
                    || lastNameParts.join(" "),
                bday: data?.bday || getMetadataValue(metadata.bday),
                favGenres: getGenreValues(data?.fav_genres).length > 0
                    ? getGenreValues(data?.fav_genres)
                    : getGenreValues(metadata.fav_genres),
                avatarUrl: data?.avatar_url || getMetadataValue(metadata.avatar_url),
                coverUrl: getMetadataValue(metadata.cover_url),
                bio: data?.bio || "",
            }

            setProfile(loadedProfile)
            setSavedProfile(loadedProfile)
            setIsLoading(false)
        }

        loadProfile()

        return () => {
            isMounted = false
        }
    }, [user])

    function updateField(field: keyof ProfileForm, value: string) {
        setProfile((currentProfile) => ({
            ...currentProfile,
            [field]: value,
        }))
    }

    function toggleGenre(genre: string) {
        setProfile((currentProfile) => ({
            ...currentProfile,
            favGenres: currentProfile.favGenres.includes(genre)
                ? currentProfile.favGenres.filter((currentGenre) => currentGenre !== genre)
                : [...currentProfile.favGenres, genre],
        }))
    }

    function cancelEditing() {
        setProfile(savedProfile)
        setError("")
        setIsGenreMenuOpen(false)
        setIsEditingProfile(false)
    }

    function startPasswordChange() {
        setIsPasswordPromptOpen(true)
    }

    function confirmPasswordChange() {
        setError("")
        setNewPassword("")
        setConfirmPassword("")
        setIsPasswordPromptOpen(false)
        setIsChangingPassword(true)
    }

    async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]

        if (!file || !user) return
        setIsAvatarMenuOpen(false)

        if (!file.type.startsWith("image/")) {
            setError("Please choose an image file.")
            return
        }

        setIsSaving(true)
        setError("")

        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const filePath = `${user.id}/avatar-${Date.now()}.${extension}`

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
            })

        if (uploadError) {
            setError(uploadError.message)
            setIsSaving(false)
            return
        }

        const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath)

        const avatarUrl = data.publicUrl

        const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                avatar_url: avatarUrl,
            })

        if (profileError) {
            setError(profileError.message)
            setIsSaving(false)
            return
        }

        const { error: authError } = await supabase.auth.updateUser({
            data: {
                avatar_url: avatarUrl,
            },
        })

        setIsSaving(false)

        if (authError) {
            setError(authError.message)
            return
        }

        setProfile((currentProfile) => ({
            ...currentProfile,
            avatarUrl,
        }))
        setSavedProfile((currentProfile) => ({
            ...currentProfile,
            avatarUrl,
        }))
        event.target.value = ""
        showNotification("Avatar updated successfully.")
    }

    async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]

        if (!file || !user) return
        setIsCoverMenuOpen(false)

        if (!file.type.startsWith("image/")) {
            setError("Please choose an image file.")
            event.target.value = ""
            return
        }

        setIsSaving(true)
        setError("")

        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const filePath = `${user.id}/cover-${Date.now()}.${extension}`

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
            })

        if (uploadError) {
            setError(uploadError.message)
            setIsSaving(false)
            event.target.value = ""
            return
        }

        const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath)

        const coverUrl = data.publicUrl
        const { error: authError } = await supabase.auth.updateUser({
            data: {
                cover_url: coverUrl,
            },
        })

        setIsSaving(false)

        if (authError) {
            setError(authError.message)
            event.target.value = ""
            return
        }

        setProfile((currentProfile) => ({
            ...currentProfile,
            coverUrl,
        }))
        setSavedProfile((currentProfile) => ({
            ...currentProfile,
            coverUrl,
        }))
        event.target.value = ""
        showNotification("Profile backdrop updated successfully.")
    }

    async function handleProfileSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!user) return

        setIsSaving(true)
        setError("")

        const firstName = profile.firstName.trim()
        const lastName = profile.lastName.trim()
        const bio = profile.bio.trim()

        const nextProfile = {
            ...profile,
            firstName,
            lastName,
            bio,
        }

        const { error: saveError } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                bday: profile.bday || null,
                fav_genres: profile.favGenres,
                avatar_url: profile.avatarUrl || null,
                bio,
            })

        if (saveError) {
            setError(saveError.message)
            setIsSaving(false)
            return
        }

        const { error: authError } = await supabase.auth.updateUser({
            data: {
                first_name: firstName,
                name: firstName,
                last_name: lastName,
                surname: lastName,
                full_name: `${firstName} ${lastName}`.trim(),
                bday: profile.bday,
                fav_genres: profile.favGenres,
                avatar_url: profile.avatarUrl,
                cover_url: profile.coverUrl,
            },
        })

        setIsSaving(false)

        if (authError) {
            setError(authError.message)
            return
        }

        setProfile(nextProfile)
        setSavedProfile(nextProfile)
        setIsEditingProfile(false)
        setIsGenreMenuOpen(false)
        showNotification("Profile updated successfully.")
    }

    async function handlePasswordSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!newPassword || newPassword.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setIsSaving(true)
        setError("")

        const { error: passwordError } = await supabase.auth.updateUser({
            password: newPassword,
        })

        setIsSaving(false)

        if (passwordError) {
            setError(passwordError.message)
            return
        }

        setNewPassword("")
        setConfirmPassword("")
        setIsChangingPassword(false)
        showNotification("Password updated successfully.")
    }

    if (isAuthLoading || isLoading) {
        return (
            <main className="min-h-screen px-4 max-w-5xl mx-auto py-10">
                <p className="text-slate-400">Loading profile...</p>
            </main>
        )
    }

    if (!user) {
        return (
            <main className="min-h-screen px-4 max-w-5xl mx-auto py-10">
                <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
                <p className="text-slate-400 mt-3">Sign in to view your profile.</p>
                <Link href="/movies" className="inline-flex mt-6 bg-indigo-400 text-[#0f172a] text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-300 transition-colors">
                    Browse movies
                </Link>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#0b1220] pb-10">
            <section className="relative overflow-hidden border-b border-[#1f2b3d]">
                <div className="absolute inset-x-0 top-0 h-72 sm:h-80">
                    {profile.coverUrl ? (
                        <img
                            src={profile.coverUrl}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-[#223a5e]" />
                    )}
                    <div className="absolute inset-0 bg-[#07101f]/20" />
                    <div className="absolute inset-0 bg-linear-to-br from-cyan-300/20 via-transparent to-[#d11c7f]/10" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-[#0b1220]" />
                    <div className="absolute right-4 top-4 z-30 sm:right-6">
                        <button
                            type="button"
                            onClick={() => setIsCoverMenuOpen((isOpen) => !isOpen)}
                            className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400 text-[#07101f] shadow-lg shadow-emerald-400/20 transition-colors hover:bg-emerald-300 cursor-pointer"
                            aria-label="Change profile backdrop"
                            aria-expanded={isCoverMenuOpen}
                        >
                            <span aria-hidden="true" className="text-2xl font-black leading-none">+</span>
                        </button>

                        {isCoverMenuOpen && (
                            <div className="absolute right-0 top-full z-40 mt-3 w-52 overflow-hidden rounded-2xl border border-emerald-300/30 bg-[#101827]/95 p-2 text-left shadow-2xl shadow-black/40 backdrop-blur-md animate-[profileModalIn_180ms_ease-out]">
                                <label className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-emerald-400/10 cursor-pointer">
                                    Upload backdrop
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="sr-only"
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pb-6 pt-36 text-center sm:pt-44">
                    <div className="relative">
                        <ProfileAvatar avatarUrl={profile.avatarUrl} initial={avatarInitial} />
                        <button
                            type="button"
                            onClick={() => setIsAvatarMenuOpen((isOpen) => !isOpen)}
                            className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-emerald-400 text-[#07101f] shadow-lg shadow-emerald-400/20 transition-colors hover:bg-emerald-300 cursor-pointer"
                            aria-label="Change avatar"
                            aria-expanded={isAvatarMenuOpen}
                        >
                            <span aria-hidden="true" className="text-2xl font-black leading-none">+</span>
                        </button>

                        {isAvatarMenuOpen && (
                            <div className="absolute left-1/2 top-full z-30 mt-3 w-52 -translate-x-1/2 overflow-hidden rounded-2xl border border-emerald-300/30 bg-[#101827]/95 p-2 text-left shadow-2xl shadow-black/40 backdrop-blur-md animate-[profileModalIn_180ms_ease-out]">
                                <label className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-emerald-400/10 cursor-pointer">
                                    Upload photo
                                    <input
                                        ref={uploadInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="sr-only"
                                    />
                                </label>
                                <label className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-emerald-400/10 cursor-pointer">
                                    Take a photo
                                    <input
                                        ref={cameraInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        onChange={handleAvatarChange}
                                        className="sr-only"
                                    />
                                </label>
                            </div>
                        )}

                    </div>

                    {isAvatarMenuOpen && (
                        <button
                            type="button"
                            aria-label="Close avatar menu"
                            onClick={() => setIsAvatarMenuOpen(false)}
                            className="fixed inset-0 z-20 cursor-default"
                            tabIndex={-1}
                        />
                    )}

                    {isCoverMenuOpen && (
                        <button
                            type="button"
                            aria-label="Close backdrop menu"
                            onClick={() => setIsCoverMenuOpen(false)}
                            className="fixed inset-0 z-20 cursor-default"
                            tabIndex={-1}
                        />
                    )}

                    <h1 className="mt-5 max-w-full wrap-break-word text-4xl font-black text-slate-100 sm:text-5xl">{fullName}</h1>
                    <div className="mt-3 flex max-w-full flex-col items-center gap-3 sm:flex-row">
                        <p className="max-w-full wrap-break-word text-sm font-semibold text-slate-300">{user.email}</p>
                        {!isEditingProfile && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("settings")
                                    setIsEditingProfile(true)
                                }}
                                className="rounded-lg bg-slate-700/70 px-4 py-2 text-xs font-bold text-slate-100 transition-colors hover:bg-slate-600 cursor-pointer"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {profile.bio && !isEditingProfile && (
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">{profile.bio}</p>
                    )}

                    <nav className="mt-8 flex w-full max-w-2xl items-center justify-center gap-2 border-b border-[#1f2b3d] sm:gap-6">
                        {[
                            { id: "reviews", label: "Reviews" },
                            { id: "watched", label: "Watched" },
                            { id: "settings", label: "Settings" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as ProfileTab)}
                                className={`border-b-2 px-3 py-3 text-sm font-bold transition-colors cursor-pointer ${activeTab === tab.id
                                    ? "border-emerald-400 text-emerald-400"
                                    : "border-transparent text-slate-300 hover:text-slate-100"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </section>

            <div className="mx-auto max-w-5xl px-4">
                {activeTab === "settings" && (
                    <>
                    <section className="mt-6 bg-[#1e293b] border border-[#2d3f55] rounded-xl p-5 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-100">Account information</h2>
                                <p className="text-sm text-slate-400 mt-1">Manage your profile details and movie taste.</p>
                            </div>

                            {!isEditingProfile && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingProfile(true)}
                                    className="self-start rounded-lg bg-slate-700/70 px-4 py-2 text-xs font-bold text-slate-100 transition-colors hover:bg-slate-600 cursor-pointer"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                {isEditingProfile ? (
                    <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={profile.firstName}
                                    onChange={(event) => updateField("firstName", event.target.value)}
                                    required
                                    className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Surname
                                </label>
                                <input
                                    type="text"
                                    value={profile.lastName}
                                    onChange={(event) => updateField("lastName", event.target.value)}
                                    required
                                    className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    value={profile.bday}
                                    onChange={(event) => updateField("bday", event.target.value)}
                                    className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 transition-colors scheme-dark cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Favourite genres
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsGenreMenuOpen((isOpen) => !isOpen)}
                                        className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-sm text-left text-slate-100 focus:outline-none focus:border-indigo-400 transition-colors cursor-pointer"
                                    >
                                        {profile.favGenres.length > 0 ? `${profile.favGenres.length} selected` : "Choose genres"}
                                    </button>

                                    {isGenreMenuOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-2 max-h-56 overflow-y-auto bg-[#0f172a] border border-[#2d3f55] rounded-xl shadow-2xl p-2 z-20">
                                            {profileGenres.map((genre) => (
                                                <label
                                                    key={genre}
                                                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#1e293b] cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={profile.favGenres.includes(genre)}
                                                        onChange={() => toggleGenre(genre)}
                                                        className="accent-indigo-400"
                                                    />
                                                    {genre}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                Bio
                            </label>
                            <textarea
                                value={profile.bio}
                                onChange={(event) => updateField("bio", event.target.value)}
                                rows={5}
                                maxLength={240}
                                placeholder="A short note about your taste in movies and TV."
                                className="w-full resize-none bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                            />
                            <p className="mt-1 text-xs text-slate-500 text-right">{profile.bio.length}/240</p>
                        </div>

                        {profile.favGenres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {profile.favGenres.map((genre) => (
                                    <button
                                        key={genre}
                                        type="button"
                                        onClick={() => toggleGenre(genre)}
                                        className="rounded-full bg-indigo-400/15 border border-indigo-400/50 text-indigo-200 px-2.5 py-1 text-xs font-semibold cursor-pointer"
                                    >
                                        {genre} ×
                                    </button>
                                ))}
                            </div>
                        )}

                        {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-[#d11c7f] hover:bg-[#b01368] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#d11c7f]/10"
                            >
                                {isSaving ? "Saving..." : "Save changes"}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEditing}
                                className="bg-[#2d3f55]/60 hover:bg-[#2d3f55] text-slate-300 text-sm font-semibold px-5 py-3 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-6 grid sm:grid-cols-2 gap-4">
                        <div className="rounded-xl bg-[#0f172a] border border-[#2d3f55] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Birth Date</p>
                            <p className="text-slate-200 mt-1">{profile.bday || "Not set yet"}</p>
                        </div>
                        <div className="rounded-xl bg-[#0f172a] border border-[#2d3f55] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Favourite genres</p>
                            <p className="text-slate-200 mt-1">{profile.favGenres.length > 0 ? profile.favGenres.join(", ") : "Not set yet"}</p>
                        </div>
                        <div className="sm:col-span-2 rounded-xl bg-[#0f172a] border border-[#2d3f55] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bio</p>
                            <p className="text-slate-200 mt-1 whitespace-pre-wrap">{profile.bio || "Not set yet"}</p>
                        </div>
                    </div>
                )}
            </section>

                    <section className="mt-5 bg-[#1e293b] border border-[#2d3f55] rounded-xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">Account security</h2>
                        <p className="text-sm text-slate-400 mt-1">Update your password separately from profile details.</p>
                    </div>

                    {!isChangingPassword && (
                        <button
                            type="button"
                            onClick={startPasswordChange}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                            Change password
                        </button>
                    )}
                </div>

                {isChangingPassword && (
                    <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    New password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    minLength={8}
                                    required
                                    className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Confirm password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    minLength={8}
                                    required
                                    className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                                />
                            </div>
                        </div>

                        {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-[#d11c7f] hover:bg-[#b01368] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#d11c7f]/10"
                            >
                                {isSaving ? "Saving..." : "Save password"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsChangingPassword(false)
                                    setNewPassword("")
                                    setConfirmPassword("")
                                    setError("")
                                }}
                                className="bg-[#2d3f55]/60 hover:bg-[#2d3f55] text-slate-300 text-sm font-semibold px-5 py-3 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
                    </section>

                    </>
                )}

                {activeTab === "reviews" && <ProfileReviews userId={user.id} />}

                {activeTab === "watched" && <ProfileWatched />}
            </div>

            {isPasswordPromptOpen && (
                <div
                    className="fixed inset-0 z-70 grid place-items-center bg-[#020617]/70 px-4 backdrop-blur-sm"
                    onClick={() => setIsPasswordPromptOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="password-confirm-title"
                        className="w-full max-w-sm rounded-2xl border border-indigo-300/25 bg-[#111827] p-5 text-left shadow-2xl shadow-black/40 animate-[profileModalIn_220ms_ease-out] sm:p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="password-confirm-title" className="text-lg font-bold text-slate-100">Change password?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            You will enter a new password on the next step.
                        </p>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsPasswordPromptOpen(false)}
                                className="rounded-xl bg-[#26364b] px-4 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:bg-[#31445f] cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmPasswordChange}
                                className="rounded-xl bg-[#d11c7f] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#d11c7f]/15 transition-colors hover:bg-[#b01368] cursor-pointer"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}