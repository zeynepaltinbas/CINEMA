// this file is the root layout
// it is required and must contain the <html> and <body> tags
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { NotificationProvider } from "@/components/NotificationProvider"

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </body>
      </html>
    )
}