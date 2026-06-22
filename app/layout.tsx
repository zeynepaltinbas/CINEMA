// this file is the root layout
// it is required and must contain the <html> and <body> tags
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { NotificationProvider } from "@/components/NotificationProvider"
import { SavedItemsProvider } from "@/components/SavedItemsProvider"
import Navbar from "@/components/Navbar"
import { Suspense } from "react"

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          <AuthProvider>
            <NotificationProvider>
              <SavedItemsProvider>
                <Suspense fallback={null}>
                  <Navbar />
                </Suspense>
                {children}
              </SavedItemsProvider>
            </NotificationProvider>
          </AuthProvider>
        </body>
      </html>
    )
}