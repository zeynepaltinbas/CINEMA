"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import { useNotification } from "@/components/NotificationProvider"
import { profileGenres } from "@/components/SortMenu"
import ProfileReviews from "@/components/ProfileReviews"
import ProfileWatched from "@/components/ProfileWatched"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import type { SubmitEvent } from "react"

interface ProfileForm {
    firstName: string;
    lastName: string;
    bday: string;
    favGenres: string[];
    avatarUrl: string;
    bio: string;
}

const emptyProfile: ProfileForm = {
    firstName: "",
    lastName: "",
    bday: "",
    favGenres: [],
    avatarUrl: "",
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
    const sizeClass = size === "large" ? "w-20 h-20 text-3xl" : "w-14 h-14 text-xl"

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt=""
                className={`${sizeClass} rounded-full object-cover border border-[#2d3f55]`}
            />
        )
    }

    return (
        <div className={`${sizeClass} rounded-full bg-[#d11c7f] text-white grid place-items-center font-bold border border-[#2d3f55]`}>
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
    const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")

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
        const isConfirmed = window.confirm("Are you sure you want to change your password?")

        if (isConfirmed) {
            setError("")
            setNewPassword("")
            setConfirmPassword("")
            setIsChangingPassword(true)
        }
    }

    async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]

        if (!file || !user) return

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
        showNotification("Avatar updated successfully.")
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
        <main className="min-h-screen px-4 max-w-5xl mx-auto py-6 sm:py-10">
            <section className="bg-[#1e293b] border border-[#2d3f55] rounded-xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <ProfileAvatar avatarUrl={profile.avatarUrl} initial={avatarInitial} />
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-slate-100 wrap-break-word">{fullName}</h1>
                            <p className="text-sm text-slate-400 wrap-break-word">{user.email}</p>
                        </div>
                    </div>

                    {!isEditingProfile && (
                        <button
                            type="button"
                            onClick={() => setIsEditingProfile(true)}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {isEditingProfile ? (
                    <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl bg-[#0f172a] border border-[#2d3f55] p-4">
                            <ProfileAvatar avatarUrl={profile.avatarUrl} initial={avatarInitial} size="small" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-100">Avatar</p>
                                <p className="text-xs text-slate-500 mt-1">Choose an image from your device.</p>
                            </div>
                            <label className="bg-[#2d3f55]/70 hover:bg-[#2d3f55] text-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer text-center">
                                Change
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="sr-only"
                                />
                            </label>
                        </div>

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

            <ProfileReviews userId={user.id} />

            <ProfileWatched />

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
        </main>
    )
}