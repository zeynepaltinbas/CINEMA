"use client"

import { supabase } from "@/lib/supabase"
import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
// ReactNode tells ts what may be passed as children (such as components, text, elements)
import type { User } from "@supabase/supabase-js"
import { setuid } from "process"
// User describes what a supabase user should look like (for typescript checks)
// import type --> needed only for typechecking, not incuded in runtime javascript

interface AuthContextValue {
    user: User | null;
    isAuthLoading: boolean;
    signOut: () => Promise<void>
}
// signOut --> Promise: runs async (a promise represents a work that will finish later)

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

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