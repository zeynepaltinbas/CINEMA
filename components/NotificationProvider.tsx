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
                <div
                    className="fixed inset-0 z-60 grid place-items-center px-4"
                    onClick={closeNotification}
                >
                    <div
                        role="status"
                        className="relative w-full max-w-md animate-[notificationIn_220ms_ease-out] bg-[#d11c7f]/70 backdrop-blur-md border border-pink-200/30 rounded-2xl shadow-2xl shadow-black/35 px-6 py-5 text-base text-white text-center sm:px-8 sm:py-6 sm:text-lg"
                    >
                        <button
                            type="button"
                            onClick={closeNotification}
                            className="absolute top-2 right-3 text-white/70 hover:text-white cursor-pointer"
                            aria-label="Close notification"
                        >
                            ✕
                        </button>
                        <p className="px-6 font-semibold leading-relaxed">{notification.message}</p>
                        {notification.action && (
                            <button
                                type="button"
                                onClick={() => {
                                    const action = notification.action
                                    closeNotification()
                                    action?.onClick()
                                }}
                                className="mt-3 text-sm text-white hover:text-pink-100 underline underline-offset-2 font-bold cursor-pointer sm:text-base"
                            >
                                {notification.action.label}
                            </button>
                        )}
                    </div>
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