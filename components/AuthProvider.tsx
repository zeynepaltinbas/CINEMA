"use client"

import { supabase } from "@/lib/supabase"
// context --> allows to share data across the entire component tree without explicitly
// passing props through every level (eliminates prop drilling)
import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
// ReactNode tells ts what may be passed as children (such as components, text, elements)
import type { User } from "@supabase/supabase-js"
// User describes what a supabase user should look like (for typescript checks)
// import type --> needed only for typechecking, not incuded in runtime javascript

interface AuthContextValue {
    user: User | null;
    isAuthLoading: boolean;
    signOut: () => Promise<void>
}
// signOut --> Promise: runs async (a promise represents a work that will finish later)

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getMetadataValue(value: unknown) {
    return typeof value === "string" ? value : ""
}

function getGenreValues(value: unknown) {
    return Array.isArray(value)
        ? value.filter((genre): genre is string => typeof genre === "string")
        : []
}

async function ensureProfileExists(currentUser: User) {
    const metadata = currentUser.user_metadata
    const fullNameFromMetadata = getMetadataValue(metadata.full_name)
    const [firstNameFromFullName = "", ...lastNameParts] = fullNameFromMetadata.split(" ")
    const firstName = getMetadataValue(metadata.first_name)
        || getMetadataValue(metadata.name)
        || firstNameFromFullName
    const lastName = getMetadataValue(metadata.last_name)
        || getMetadataValue(metadata.surname)
        || lastNameParts.join(" ")

    await supabase
        .from("profiles")
        .upsert({
            id: currentUser.id,
            first_name: firstName,
            last_name: lastName,
            bday: getMetadataValue(metadata.bday) || null,
            fav_genres: getGenreValues(metadata.fav_genres),
            avatar_url: getMetadataValue(metadata.avatar_url) || null,
            bio: "",
        }, {
            onConflict: "id",
            ignoreDuplicates: true,
        })
}

export function AuthProvider({ children }: {children: ReactNode}) {
    // the angle brackets give ts extra type info (generic type argument)
    const [user, setUser] = useState<User | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)

    // checks who is signed in when app first loads
    // listens for future sign in and sign out events
    useEffect(() => {
        // remembers if AuthProvider is still displayed
        let isMounted = true

        supabase.auth.getUser().then(({ data }) => {
            if (isMounted) {
                setUser(data.user)
                setIsAuthLoading(false)
            }
        })

        // event is currently not used, and _ shows that this is intentional
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setIsAuthLoading(false)
        })

        // a function returned from useEffect is its cleanup function
        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!user) return

        ensureProfileExists(user)
    }, [user])

    async function signOut() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            throw error
        }
    }

    // react context provider --> a component that allows to share data down the entire component tree
    // without manually passing props through every level
    return (
        <AuthContext.Provider value={{ user, isAuthLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider")
    }

    return context
}