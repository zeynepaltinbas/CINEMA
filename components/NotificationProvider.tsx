"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

interface NotificationAction {
    label: string;
    onClick: () => void;
}

interface Notification {
    message: string;
    action?: NotificationAction;
}

interface NotificationContextValue {
    showNotification: (message: string, action?: NotificationAction) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<Notification | null>(null)

    const closeNotification = useCallback(() => {
        setNotification(null)
    }, [])

    const showNotification = useCallback((message: string, action?: NotificationAction) => {
        setNotification({ message, action })
    }, [])

    useEffect(() => {
        if (!notification)
            return

        const timer = setTimeout(closeNotification, 5000)
        return () => clearTimeout(timer)
    }, [notification, closeNotification])

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {notification && (
                <div role="status" className="fixed bottom-10 right-4 z-60 w-[calc(100%-2rem)] max-w-sm bg-[#d11c7f]/90 backdrop-blur-sm border border-pink-300/30 rounded-xl shadow-2xl shadow-black/30 p-4 text-sm text-white text-center">
                <button
                    type="button"
                    onClick={closeNotification}
                    className="absolute top-2 right-3 text-white/70 hover:text-white cursor-pointer"
                    aria-label="Close notification"
                >
                    ✕
                </button>
                <p className="px-6">{notification.message}</p>
                {notification.action && (
                    <button
                        type="button"
                        onClick={() => {
                            const action = notification.action
                            closeNotification()
                            action?.onClick()
                        }}
                        className="mt-2 text-white hover:text-pink-100 underline underline-offset-2 font-semibold cursor-pointer"
                    >
                        {notification.action.label}
                    </button>
                )}
            </div>
            )}
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)

    if (!context) {
        throw new Error("useNotification must be used inside NotificationProvider.")
    }

    return context
}